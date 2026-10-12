import { contacts } from "@/content/aloqa";
import { phoneText, telHref } from "@/lib/format";

// Suzuvchi qo'ng'iroq tugmasi (§6): faqat haqiqiy raqam bilan tel: havola. Kompyuterda ko'rinadi (demo kabi).
export function CallFab() {
  return (
    <a className="fab" href={telHref(contacts.phone)} aria-label={`Qo‘ng‘iroq qilish: ${phoneText(contacts.phone)}`}>
      <span aria-hidden="true">📞</span>
    </a>
  );
}
