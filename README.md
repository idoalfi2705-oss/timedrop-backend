# TimeDrop Backend

## דרישות מוקדמות
1. **Node.js** – https://nodejs.org (LTS)
2. **PostgreSQL** – https://www.postgresql.org/download/windows

---

## התקנה והרצה

### שלב 1 – התקן תלויות
```bash
npm install
```

### שלב 2 – הגדר את קובץ .env
פתח את `.env` ועדכן:
```
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/timedrop"
```
החלף `YOUR_PASSWORD` בסיסמא שהגדרת ב-PostgreSQL.

### שלב 3 – צור את מסד הנתונים
```bash
npm run db:push
```

### שלב 4 – הפעל את השרת
```bash
npm run dev
```
השרת יפעל על: http://localhost:5000

---

## בדיקת חיבור לפריוריטי
אחרי שתקבל גישה לפריוריטי, עדכן ב-.env:
```
PRIORITY_BASE_URL=https://your-company.priority-erpcloud.com
PRIORITY_USERNAME=your_username
PRIORITY_PASSWORD=your_password
PRIORITY_COMPANY=your_company_code
```
ואז בדוק בדפדפן: http://localhost:5000/api/priority-test

---

## API Endpoints

| Method | URL | תיאור |
|--------|-----|--------|
| POST | /api/auth/login | כניסה |
| POST | /api/auth/register | יצירת משתמש |
| GET | /api/clients | רשימת לקוחות |
| GET | /api/clients/:id | לקוח + חשבוניות |
| GET | /api/orders | רשימת הזמנות |
| POST | /api/orders | הזמנה חדשה |
| GET | /api/warehouses | רשימת מחסנים |
| GET | /api/warehouses/:id/stock | מלאי מחסן |
| GET | /api/workers | רשימת עובדים |
| GET | /api/workers/leave-requests | בקשות חופשה |
| POST | /api/workers/leave | בקשת חופשה חדשה |
| PATCH | /api/workers/leave/:id | אישור/דחיית חופשה |
| GET | /api/deliveries/today | לו"ז יומי לעובד |
| PATCH | /api/deliveries/:id/status | עדכון סטטוס משלוח |

---

## חיבור ה-Frontend ל-Backend
בתיקיית `timedrop` (הפרונט), צור קובץ `.env`:
```
REACT_APP_API_URL=http://localhost:5000
```
