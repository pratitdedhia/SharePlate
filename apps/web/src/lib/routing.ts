/**
 * Volunteer Route Generation & Multi-Stop Waypoint Management
 * Generates verified Google Maps directions URLs for accepted SharePlate trips.
 * Ensures all donor pickups and recipient deliveries are ordered sequentially
 * ending at the volunteer's selected final destination.
 * Automatically segments trips exceeding Google Maps' 9-waypoint limit.
 */

export interface RouteSegment {
  segmentNumber: number;
  totalSegments: number;
  label: string;
  origin: string;
  destination: string;
  waypoints: string[];
  stopsCount: number;
  url: string;
}

export interface RouteStopInput {
  id?: string;
  name: string;
  address: string;
  city?: string;
  type: 'start' | 'pickup' | 'delivery' | 'destination';
}

/**
 * Standard Google Maps URL parameter limit: at most 9 waypoints per directions request.
 * (1 origin + 9 waypoints + 1 destination = 11 total stops max)
 */
export const GOOGLE_MAPS_MAX_WAYPOINTS = 9;

/**
 * Generates one or more Google Maps directions links for an accepted SharePlate trip.
 * Sets the volunteer's personal final destination as the route destination.
 * If waypoints exceed Google Maps limits, splits the trip into clearly ordered route segments.
 */
export function generateGoogleMapsTripSegments(
  originAddress: string,
  destinationAddress: string,
  sharePlateTaskStops: RouteStopInput[]
): RouteSegment[] {
  // If no task stops, generate simple commute route
  if (!sharePlateTaskStops || sharePlateTaskStops.length === 0) {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(originAddress)}&destination=${encodeURIComponent(destinationAddress)}`;
    return [
      {
        segmentNumber: 1,
        totalSegments: 1,
        label: 'Direct Commute Leg',
        origin: originAddress,
        destination: destinationAddress,
        waypoints: [],
        stopsCount: 2,
        url,
      },
    ];
  }

  // If task stops fit within Google Maps waypoint limit (<= 9 waypoints)
  if (sharePlateTaskStops.length <= GOOGLE_MAPS_MAX_WAYPOINTS) {
    const waypoints = sharePlateTaskStops.map((s) => s.address);
    const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
      originAddress
    )}&destination=${encodeURIComponent(destinationAddress)}&waypoints=${encodeURIComponent(
      waypoints.join('|')
    )}`;

    return [
      {
        segmentNumber: 1,
        totalSegments: 1,
        label: `Full Trip (${sharePlateTaskStops.length} SharePlate Handoffs → Final Destination)`,
        origin: originAddress,
        destination: destinationAddress,
        waypoints,
        stopsCount: sharePlateTaskStops.length + 2,
        url,
      },
    ];
  }

  // If task stops exceed 9 waypoints, partition into ordered segments
  const segments: RouteSegment[] = [];
  let currentOrigin = originAddress;
  let remainingStops = [...sharePlateTaskStops];
  let segmentIndex = 1;

  while (remainingStops.length > 0) {
    if (remainingStops.length <= GOOGLE_MAPS_MAX_WAYPOINTS) {
      // Final segment ends at volunteer's personal destination
      const waypoints = remainingStops.map((s) => s.address);
      const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
        currentOrigin
      )}&destination=${encodeURIComponent(destinationAddress)}&waypoints=${encodeURIComponent(
        waypoints.join('|')
      )}`;

      segments.push({
        segmentNumber: segmentIndex,
        totalSegments: segmentIndex,
        label: `Route Segment ${segmentIndex} (Final Deliveries → ${destinationAddress.split(',')[0]})`,
        origin: currentOrigin,
        destination: destinationAddress,
        waypoints,
        stopsCount: waypoints.length + 2,
        url,
      });
      break;
    } else {
      // Slice first 8 waypoints, and the 9th becomes the segment's destination
      const batchWaypoints = remainingStops.slice(0, GOOGLE_MAPS_MAX_WAYPOINTS - 1).map((s) => s.address);
      const segmentDestStop = remainingStops[GOOGLE_MAPS_MAX_WAYPOINTS - 1];
      const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
        currentOrigin
      )}&destination=${encodeURIComponent(segmentDestStop.address)}&waypoints=${encodeURIComponent(
        batchWaypoints.join('|')
      )}`;

      segments.push({
        segmentNumber: segmentIndex,
        totalSegments: segmentIndex,
        label: `Route Segment ${segmentIndex} (${batchWaypoints.length + 1} SharePlate Handoffs)`,
        origin: currentOrigin,
        destination: segmentDestStop.address,
        waypoints: batchWaypoints,
        stopsCount: batchWaypoints.length + 2,
        url,
      });

      currentOrigin = segmentDestStop.address;
      remainingStops = remainingStops.slice(GOOGLE_MAPS_MAX_WAYPOINTS);
      segmentIndex++;
    }
  }

  // Normalize total segments count and labels
  const total = segments.length;
  segments.forEach((s) => {
    s.totalSegments = total;
    s.label = `Route Segment ${s.segmentNumber} of ${total}`;
  });

  return segments;
}
