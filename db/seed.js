const db = require('./database');

const listings = [
  { title: 'Hyundai i20', price: '₹2000/day', status: 'pending' },
  { title: 'Honda City', price: '₹2500/day', status: 'pending' },
  { title: 'Suzuki Swift', price: '₹1800/day', status: 'pending' },
  { title: 'Toyota Innova', price: '₹3000/day', status: 'pending' },
  { title: 'Tata Nexon', price: '₹2200/day', status: 'pending' },
  { title: 'Ford EcoSport', price: '₹2100/day', status: 'pending' },
];

listings.forEach((car) => {
  db.prepare('INSERT INTO listings (title, price, status) VALUES (?, ?, ?)')
    .run(car.title, car.price, car.status);
});

console.log('Seeded 6 listings');
