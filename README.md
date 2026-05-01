# 🥊 Stoica Brothers Academy

Site oficial pentru **Stoica Brothers Fight Academy** — un club sportiv de elită pentru arte marțiale și sporturi de contact, fondat de frații **Bogdan și Andrei Stoica**, campioni naționali și internaționali.

---

## 📋 Descriere

Platformă web modernă pentru prezentarea clubului, programărilor, antrenorilor și realizărilor sportivilor, un panel de administrare pentru gestionarea site-ului.

---

## 🛠️ Tehnologii

| Categorie | Tehnologii |
|-----------|------------|
| **Frontend** | React 19, Vite 6, TypeScript |
| **Stilizare** | Tailwind CSS 4, Motion (framer-motion) |
| **Animații** | GSAP, Embla Carousel |
| **Backend** | Express.js, Node.js |
| **Baze de date** | MongoDB (Mongoose) |
| **Routing** | React Router DOM |
| **Upload** | Multer (pentru imagini) |

---

## 🚀 Funcționalități

### Pagini principale
- **Acasă (Hero)** — Prezentare vizuală cu video/image background, animații cinematice
- **Despre Noi** — Istoria clubului, palmares, galele de box
- **Discipline** — Kickboxing, Box, MMA, BJJ — cu descrieri și caracteristici
- **Antrenori** — Profilurile antrenorilor (Bogdan & Andrei Stoica)
- **Program** — Orarul antrenamentelor pe zile
- **Programe de antrenament** — Pachete de prețuri (Trial, Lunar, Anual)
- **Competiții** — Rezultate și galele organizate
- **Galerie** — Galerie foto și video
- **Testimoniale** — Recenziile sportivilor
- **Contact** — Formular de contact, hartă, informații

### Funcționalități avansate
- 🎥 **Integrare video** — YouTube embed pentru gale și clipuri
- 🖼️ **Upload imagini** — Sistem de upload pentru galerii și profiluri
- 🤖 **AI Generator** — Generare automată de conținut cu Gemini
- ⚙️ **Admin Panel** — Panou de administrare pentru conținut
- 📱 **Design responsiv** — Optimizat pentru mobil, tabletă, desktop
- ✨ **Animații** — Tranziții smooth cu Motion și GSAP

---

## 📦 Instalare

```bash
# Clonează proiectul și navighează în folder
cd STOICA-BR

# Instalează dependențele
npm install
```

### Variabile de mediu

Creează un fișier `.env.local` în rădăcina proiectului:
---

## 🏃 Rulare

```bash
# Mod dezvoltare (server Express + Vite)
npm run dev

# Build producție
npm run build

# Previzualizare build
npm run preview

# Curățare build
npm run clean

# Verificare TypeScript
npm run lint
```

---

## 📁 Structura proiectului

```
STOICA-BR/
├── src/
│   ├── components/       # Componente React
│   │   ├── About.tsx      # Despre noi
│   │   ├── AdminPanel.tsx # Panou admin
│   │   ├── Coaches.tsx    # Antrenori
│   │   ├── Competitions.tsx
│   │   ├── Contact.tsx
│   │   ├── Disciplines.tsx
│   │   ├── Footer.tsx
│   │   ├── Gallery.tsx
│   │   ├── Hero.tsx       # Pagina principală
│   │   ├── Navbar.tsx
│   │   ├── Schedule.tsx
│   │   ├── Testimonials.tsx
│   │   └── ...
│   ├── lib/
│   │   ├── palmares.ts    # Palmares și realizări
│   │   └── utils.ts       # Utilități
│   ├── services/
│   │   └── api.ts         # API calls
│   ├── App.tsx            # Componenta principală
│   ├── main.tsx           # Punct de intrare
│   ├── constants.ts       # Date constante
│   └── types.ts           # Tipuri TypeScript
├── server.ts              # Server Express
├── vite.config.ts         # Configurare Vite
├── tsconfig.json          # Configurare TypeScript
├── package.json
└── README.md
```

---

## 👥 Echipa

### Fondatori
- **Bogdan Stoica** — Campion național și internațional de box/Kickboxing
- **Andrei Stoica** — Campion național și internațional de box/Kickboxing

### Discipline predate
- 🥊 **Kickboxing** — Arte marțiale cu opt membre
- 🥖 **Box** — Nobile artă a autoapărării
- 🅼️ **MMA** — Mixed Martial Arts
- 🅱️ **BJJ** — Brazilian Jiu-Jitsu

---

## 🔧 Configurare avansată

### MongoDB
Proiectul folosește MongoDB pentru stocarea datelor. Configurează stringul de conexiune în `server.ts`.

### Upload fișiere
- Folder-ul `uploads/` stochează imaginile uploadate
- Configurabil prin `multer` în server

---

## 📝 Licență

Proprietar © 2026 Stoica Brothers Academy

---

## 📞 Contact

- **Email:** contact@stoicabrothers.ro
- **Telefon:** [număr de telefon]
- **Locație:** [adresa clubului]

---

*Creat cu React, Vite și pasiunea pentru arte marțiale.*

## 📄 Licență

Proprietar
