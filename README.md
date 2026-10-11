# Todo Beisbol

## Backend (puerto 5002)
```
cd backend
npm install
mysql -u root -p < schema.sql
mysql -u root -p < datos.sql     # opcional: datos de ejemplo + usuario admin / 1234
node index.js
```

## Frontend
```
cd frontend
npm install
npm run dev
```
La URL del backend está en `frontend/src/Backend.jsx`.
