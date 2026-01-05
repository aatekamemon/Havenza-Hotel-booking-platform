export const users = [
  { id: 1, name: 'Alice', email: 'alice@example.com', role: 'Admin' },
  { id: 2, name: 'Bob', email: 'bob@example.com', role: 'User' },
  { id: 3, name: 'Charlie', email: 'charlie@example.com', role: 'User' },
];

export const hotels = [
  { id: 1, name: 'Grand Hotel', city: 'Ahmedabad', owner: 'Alice' },
  { id: 2, name: 'Sea View', city: 'Surat', owner: 'Bob' },
];

export const hotelOwners = [
  { id: 1, name: 'Alice', email: 'alice@example.com', hotels: 2 },
  { id: 2, name: 'Bob', email: 'bob@example.com', hotels: 1 },
];

export const bookings = [
  { id: 1, user: 'Charlie', hotel: 'Grand Hotel', amount: 5000, status: 'Completed' },
  { id: 2, user: 'Bob', hotel: 'Sea View', amount: 3000, status: 'Pending' },
];
