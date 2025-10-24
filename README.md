# Ilove2Hand
[เว็บขายของมือสอง (3).pdf](https://github.com/user-attachments/files/23112565/3.pdf)
<img width="1112" height="626" alt="image" src="https://github.com/user-attachments/assets/d970c06f-7514-411a-a636-3f61fcb38ec7" />

โปรเจกต์เว็บไซต์ซื้อ-ขาย/ประมูลเสื้อผ้ามือสอง รองรับอัปโหลดรูปสินค้า ระบบประมูล และสั่งซื้อ

## 👥 Team Members
- Thanatchai Chanabua  650610769 — Fullstack/Infra 
- Purinee Montree 650612096 — Frontend/UXUI design
- Purinee Montree 650612096 — Backend/DB

## 🧰 Tech Stack
- **Frontend**: Next.js (React), TypeScript, TailwindCSS
- **API**: Next.js API Routes (Node.js)
- **ORM/DB**: Prisma + PostgreSQL
- **Container/Deploy (local)**: Docker & Docker Compose

## ⚙️ Environment Variables
ดูตัวอย่างใน `.env.local` (ไฟล์ตัวอย่างที่คอมมิตไว้) แล้วสร้าง `.env` จริงในเครื่องคุณเอง  
> **ห้าม**ใส่ค่า Production จริงลงใน repo

## 🚀 เริ่มพัฒนาบน Local (ไม่ใช้ Docker)
```bash
npm ci || npm i
npx prisma generate
npx prisma migrate dev
npm run seed
npm run dev
```
# เปิด http://localhost:3000

## 🐳 รันแบบ Container (แอพ + DB)
```bash 
docker compose up --build

app: http://localhost:3000
db: localhost:5432

.
├─ pages/ # Next.js pages & API routes
├─ prisma/ # Prisma schema และ seed script
├─ data/ # ข้อมูลพื้นฐาน (.json, .sql)
├─ public/ # assets
├─ controllers/, services/, lib/, models/, components/
├─ .env.local # ตัวอย่าง env พร้อมคำอธิบาย (ห้ามใส่ค่าจริงลง repo)
├─ .gitignore
├─ Dockerfile.frontend
├─ Dockerfile.backend # (ตัวเลือก แยก target build)
└─ docker-compose.yml


![image](https://github.com/user-attachments/assets/9897509f-e094-4487-b087-c54353cf7578)
![image](https://github.com/user-attachments/assets/a7e49a69-4c13-4a32-a5d8-d65a613eb81e)
![image](https://github.com/user-attachments/assets/f8a49202-0fbe-4f22-94b9-d81d7b8c5001)

![image](https://github.com/user-attachments/assets/66df2af0-4d2b-426e-87ab-e4c07a3f1cc3)
DATABASE_URL="postgresql://postgres:pensiri123@localhost:5432/icn_freeze?schema=public"
