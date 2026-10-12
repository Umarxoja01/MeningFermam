// Muammo kartochkalari (TZ v3.1 §4.1). 9 ta asl kartochka; faqat 8-kartochka "Zot" → "Vazn" (Y-02).
import type { Problem } from "@meningfermam/content";

export type { Problem };

export const problemsHead = { chip: "Sizda ham shunday bo‘lganmi?", title: "Bosing, yechimini ko‘ring" };

export const problems: Problem[] = [
  { emoji: "🥛", topic: "Sigir", question: "Yemga qancha pul ketyapti, bilmayman", href: "#yem" },
  { emoji: "🐂", topic: "Buqa", question: "Boqyapman, lekin o‘zini oqlamayapti", href: "#yem" },
  { emoji: "🐑", topic: "Qo‘y", question: "Qo‘ylarim ozib ketyapti", href: "#kasal" },
  { emoji: "💊", topic: "Dori", question: "Dori berdim, foyda qilmadi", href: "#kasal" },
  { emoji: "🧴", topic: "Ombor", question: "Qaysi dori qancha qoldi, bilmayman", href: "#ombor" },
  { emoji: "⏰", topic: "Eslatma", question: "Ukolning 2-kunini unutdim", href: "#eslatma" },
  { emoji: "🐮", topic: "Buzoq", question: "Buzoqning ichi ketyapti", href: "#kasal" },
  { emoji: "⚖️", topic: "Vazn", question: "Molimning vazniga qarab qancha yem kerak?", href: "#yem" },
  { emoji: "📊", topic: "Foyda", question: "Qaysi molim zarar qilyapti?", href: "#statistika" },
];
