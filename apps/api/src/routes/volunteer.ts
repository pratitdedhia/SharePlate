import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';
import { getSupabaseAdmin } from '../config/supabase.js';

const router = Router();

router.use(authenticateToken);
router.use(requireRoles(['volunteer', 'admin']));

/**
 * GET /api/volunteer/tasks
 * Returns available rescue tasks needing volunteer courier transport.
 */
router.get('/tasks', async (req: Request, res: Response) => {
  try {
    const { corridor } = req.query;
    const supabase = getSupabaseAdmin();

    // Query active available or claimed donations that have not completed delivery
    const { data: donations, error } = await supabase
      .from('donations')
      .select(`
        id, title, category, quantity_total, quantity_available, quantity_unit,
        pickup_deadline, pickup_instructions, city, location_label, status,
        donor:profiles!donor_id (id, full_name, organization_name, phone),
        claims (
          id, recipient_id, quantity_claimed, status, verification_status,
          recipient:profiles!recipient_id (id, full_name, organization_name, phone, city)
        )
      `)
      .in('status', ['available', 'reserved', 'claimed'])
      .order('created_at', { ascending: false });

    if (error) {
      res.status(500).json({ success: false, message: error.message });
      return;
    }

    // Map into rescue task format
    const tasks = (donations || []).map((d: any) => {
      const activeClaim = d.claims && d.claims.length > 0 ? d.claims[0] : null;
      return {
        id: `task-${d.id.slice(0, 8)}`,
        donation_id: d.id,
        claim_id: activeClaim?.id || null,
        title: d.title,
        category: d.category,
        portions: activeClaim?.quantity_claimed || d.quantity_total,
        pickup_location: d.location_label || d.city,
        pickup_address: `${d.location_label || ''}, ${d.city}`,
        pickup_deadline: d.pickup_deadline,
        pickup_instructions: d.pickup_instructions,
        donor_name: d.donor?.organization_name || d.donor?.full_name || 'Donor Kitchen',
        donor_phone: d.donor?.phone,
        dropoff_location: activeClaim?.recipient?.organization_name || 'Community Shelter Hub',
        dropoff_address: `${activeClaim?.recipient?.organization_name || 'Shelter'}, ${d.city}`,
        recipient_name: activeClaim?.recipient?.full_name || 'Distribution Coordinator',
        recipient_phone: activeClaim?.recipient?.phone,
        corridor: d.city === 'Mumbai' ? 'Mumbai Central Transit Corridor' : d.city === 'Pune' ? 'Pune University Corridor' : 'Delhi North-West Corridor',
        status: d.status,
      };
    });

    const filtered = corridor
      ? tasks.filter((t) => t.corridor.toLowerCase().includes((corridor as string).toLowerCase()))
      : tasks;

    res.status(200).json({ success: true, data: filtered });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching volunteer tasks' });
  }
});

/**
 * GET /api/volunteer/trip-plan/active
 * Retrieves the currently active trip plan and sequential stops for the authenticated volunteer.
 */
router.get('/trip-plan/active', async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const supabase = getSupabaseAdmin();

    const { data: plan, error } = await supabase
      .from('volunteer_trip_plans')
      .select(`
        *,
        stops:volunteer_trip_stops (*)
      `)
      .eq('volunteer_id', user.id)
      .in('status', ['accepted', 'in_progress'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      res.status(500).json({ success: false, message: error.message });
      return;
    }

    if (plan && plan.stops) {
      plan.stops.sort((a: any, b: any) => a.sequence - b.sequence);
    }

    res.status(200).json({ success: true, data: plan || null });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching active trip plan' });
  }
});

/**
 * POST /api/volunteer/trip-plans
 * Creates and accepts a commute trip plan with stops for the authenticated volunteer.
 */
router.post('/trip-plans', async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const supabase = getSupabaseAdmin();
    const { origin, destination, corridor_label, task_ids = [], stops = [] } = req.body;

    if (!origin || !destination) {
      res.status(400).json({ success: false, message: 'Origin and destination are required' });
      return;
    }

    // 1. Insert plan
    const { data: plan, error: planErr } = await supabase
      .from('volunteer_trip_plans')
      .insert({
        volunteer_id: user.id,
        origin,
        destination,
        corridor_label: corridor_label || 'Custom Corridor',
        task_ids,
        status: 'accepted',
        accepted_at: new Date().toISOString(),
        is_demo_preview: Boolean(req.body.is_demo_preview),
        routing_provider_note: req.body.routing_provider_note || null,
      })
      .select()
      .single();

    if (planErr || !plan) {
      res.status(400).json({ success: false, message: planErr?.message || 'Failed to create trip plan' });
      return;
    }

    // 2. Insert stops
    if (stops && stops.length > 0) {
      const stopsToInsert = stops.map((s: any, idx: number) => ({
        plan_id: plan.id,
        sequence: s.sequence || idx + 1,
        type: s.type || 'pickup',
        name: s.name,
        address: s.address,
        city: s.city || 'Delhi NCR',
        contact_person: s.contact_person,
        phone: s.phone,
        instructions: s.instructions,
        task_id: s.task_id,
        portions: s.portions,
        food_title: s.food_title,
        dietary_type: s.dietary_type,
        completed: Boolean(s.completed),
        completed_at: s.completed ? new Date().toISOString() : null,
      }));

      await supabase.from('volunteer_trip_stops').insert(stopsToInsert);
    }

    // 3. Assign volunteer to corresponding claims
    for (const taskId of task_ids) {
      // If taskId matches task-donation format or claim id
      const donationId = taskId.replace('task-', '');
      await supabase
        .from('claims')
        .update({
          volunteer_id: user.id,
          verification_status: 'accepted',
        })
        .or(`id.eq.${taskId},donation_id.eq.${donationId}`);
    }

    // Fetch complete plan with stops
    const { data: completePlan } = await supabase
      .from('volunteer_trip_plans')
      .select('*, stops:volunteer_trip_stops (*)')
      .eq('id', plan.id)
      .single();

    if (completePlan && completePlan.stops) {
      completePlan.stops.sort((a: any, b: any) => a.sequence - b.sequence);
    }

    res.status(201).json({
      success: true,
      message: 'Trip plan accepted and stops scheduled',
      data: completePlan,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error creating trip plan' });
  }
});

/**
 * PATCH /api/volunteer/trip-plans/:id/stops/:stopId
 * Marks a trip stop as visited and completed.
 */
router.patch('/trip-plans/:id/stops/:stopId', async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { id: planId, stopId } = req.params;
    const supabase = getSupabaseAdmin();

    // Verify ownership of the plan
    const { data: plan } = await supabase
      .from('volunteer_trip_plans')
      .select('volunteer_id')
      .eq('id', planId)
      .single();

    if (!plan || (plan.volunteer_id !== user.id && user.role !== 'admin')) {
      res.status(403).json({ success: false, message: 'Unauthorized: Not your trip plan' });
      return;
    }

    const { data: stop, error: stopErr } = await supabase
      .from('volunteer_trip_stops')
      .update({
        completed: true,
        completed_at: new Date().toISOString(),
      })
      .eq('id', stopId)
      .eq('plan_id', planId)
      .select()
      .single();

    if (stopErr) {
      res.status(400).json({ success: false, message: stopErr.message });
      return;
    }

    res.status(200).json({ success: true, message: 'Stop marked completed', data: stop });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error updating stop' });
  }
});

export default router;
