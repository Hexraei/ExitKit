export interface RoomTemplate {
  id: string;
  name: string;
  items: string[];
}

/** Four fixed room templates - scope kept tight on purpose. */
export const ROOM_TEMPLATES: RoomTemplate[] = [
  {
    id: 'bedroom',
    name: 'Bedroom',
    items: ['Walls and paint', 'Floor', 'Windows and grills', 'Fan and lights', 'Cupboards / shelves', 'Door and lock'],
  },
  {
    id: 'kitchen',
    name: 'Kitchen',
    items: ['Counters and sink', 'Stove and chimney', 'Cabinets', 'Taps and plumbing', 'Appliances left behind', 'Floor and tiles'],
  },
  {
    id: 'bathroom',
    name: 'Bathroom',
    items: ['Toilet and flush', 'Shower and taps', 'Mirror and fittings', 'Tiles and floor', 'Geyser', 'Exhaust fan'],
  },
  {
    id: 'living',
    name: 'Living room',
    items: ['Walls and paint', 'Floor', 'Windows and curtains', 'Switches and sockets', 'Furniture left behind', 'Main door and keys'],
  },
];

export const METER_KINDS = [
  { kind: 'electricity' as const, label: 'Electricity', unit: 'kWh' },
  { kind: 'water' as const, label: 'Water', unit: 'kL' },
  { kind: 'gas' as const, label: 'Gas', unit: 'kg' },
];
