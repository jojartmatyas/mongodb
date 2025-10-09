# mongodb

Hasznos linkek:
- https://mega.nz/file/ArJ1VIgC#ZwstLLWHbBtCKZHvDA7LGIPXQJW7Y5jkMKVussLv5RM
- https://mega.nz/file/kqg3SITA#_R-1rY8sGutfz-rLc8kEOCQiqPGVhVcpHQDgX-_x9sY

---

## Nudli Fordító – Footer Demo

Egyszerű React + Vite projekt, ami tartalmaz egy testreszabható lábléc komponenst.

### Indítás

```powershell
npm install
npm run dev
```

Alapértelmezés szerint a fejlesztői szerver a http://localhost:5173 címen indul.

### Fájlstruktúra

- `index.html` – belépési pont
- `src/main.jsx` – React inicializálás
- `src/App.jsx` – fő alkalmazás komponens
- `src/components/Footer.jsx` – lábléc
- `src/styles.css` – globális és lábléc stílusok

### Lábléc testreszabása
A `src/components/Footer.jsx` fájlban módosíthatod a linkeket:
```jsx
<a href="/docs">Dokumentáció</a>
<a href="https://github.com/felhasznalo/nudli-fordito">Forráskód (GitHub)</a>
```
Cseréld a GitHub URL-t a saját repódra.

### Build
```powershell
npm run build
npm run preview
```
