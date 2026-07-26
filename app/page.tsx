"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  PRODUCT_FEES,
  searchProductFees,
  type ProductFee,
} from "./shopee-fees";

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

type PageId =
  | "dashboard"
  | "input"
  | "category"
  | "ads"
  | "result"
  | "scenario";
type SellerType = "nonstar" | "star" | "mall";
type PriceMode = "auto" | "manual";
type Theme = "light" | "dark";
type IconName =
  | "home"
  | "input"
  | "category"
  | "ads"
  | "result"
  | "scenario"
  | "calculator"
  | "guide"
  | "sun"
  | "moon"
  | "reset"
  | "save"
  | "sparkles"
  | "arrow"
  | "search";

type Scenario = {
  id: string;
  name: string;
  savedAt: string;
  data: Record<string, number | string | boolean>;
};

type NumberFieldProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
  hint?: string;
  min?: number;
  max?: number;
  step?: number;
};

const NAV_ITEMS: Array<{
  id: PageId;
  label: string;
  shortLabel: string;
  icon: IconName;
}> = [
  { id: "dashboard", label: "Dashboard", shortLabel: "Home", icon: "home" },
  { id: "input", label: "Input Produk", shortLabel: "Input", icon: "input" },
  { id: "category", label: "Kategori & Admin", shortLabel: "Kategori", icon: "category" },
  { id: "ads", label: "Kalkulator Iklan", shortLabel: "Iklan", icon: "ads" },
  { id: "result", label: "Hasil & Rincian", shortLabel: "Hasil", icon: "result" },
  { id: "scenario", label: "Skenario", shortLabel: "Simpan", icon: "scenario" },
];

const MOBILE_NAV_ORDER: PageId[] = [
  "dashboard",
  "input",
  "result",
  "ads",
  "category",
];

const ONBOARDING_STEPS: Array<{
  icon: IconName;
  eyebrow: string;
  title: string;
  description: string;
  detail: string;
}> = [
  {
    icon: "input",
    eyebrow: "Langkah 1 dari 3",
    title: "Mulai dari biaya produk",
    description:
      "Masukkan HPP, kemasan, operasional, diskon, dan voucher yang benar-benar ditanggung toko.",
    detail: "Angka yang tampil sekarang adalah contoh dan aman untuk diganti.",
  },
  {
    icon: "category",
    eyebrow: "Langkah 2 dari 3",
    title: "Cari produk & cek tarif",
    description:
      "Ketik nama produk agar biaya admin dan layanan muncul otomatis, lalu aktifkan program yang benar-benar diikuti.",
    detail:
      "Anda masih bisa mengubah tarif manual jika rincian Seller Centre berbeda.",
  },
  {
    icon: "result",
    eyebrow: "Langkah 3 dari 3",
    title: "Baca harga aman dan laba",
    description:
      "Aplikasi menghitung harga jual, dana cair, titik impas, biaya iklan, dan laba bersih per item.",
    detail: "Simpan beberapa skenario untuk membandingkan strategi harga.",
  },
];

function AppIcon({
  name,
  size = 18,
}: {
  name: IconName;
  size?: number;
}) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.7,
  };

  return (
    <svg
      aria-hidden="true"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      {...common}
    >
      {name === "home" ? (
        <>
          <path d="m3.5 10 8.5-7 8.5 7" />
          <path d="M5.5 9v11h13V9M9.5 20v-6h5v6" />
        </>
      ) : null}
      {name === "input" ? (
        <>
          <rect height="15" rx="3" width="18" x="3" y="5" />
          <path d="M7 9h10M8 14h4M15.5 12.5v4M13.5 14.5h4" />
        </>
      ) : null}
      {name === "category" ? (
        <>
          <rect height="7" rx="2" width="7" x="3" y="3" />
          <rect height="7" rx="2" width="7" x="14" y="3" />
          <rect height="7" rx="2" width="7" x="3" y="14" />
          <rect height="7" rx="2" width="7" x="14" y="14" />
        </>
      ) : null}
      {name === "ads" ? (
        <>
          <path d="M4 13.5v-3l11-5v13l-11-5Z" />
          <path d="m7 15 1.5 5h3L10 14.8M18 9a4.5 4.5 0 0 1 0 6" />
        </>
      ) : null}
      {name === "result" ? (
        <>
          <path d="M4 4h16v16H4zM8 8h8M8 12h3M8 16h3" />
          <path d="M15.5 12.5v5M13.5 15h4" />
        </>
      ) : null}
      {name === "scenario" || name === "save" ? (
        <>
          <path d="M5 3h11l3 3v15H5z" />
          <path d="M8 3v6h8V3M8 17h8v4" />
        </>
      ) : null}
      {name === "calculator" ? (
        <>
          <rect height="18" rx="3" width="16" x="4" y="3" />
          <path d="M8 7h8M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01" />
        </>
      ) : null}
      {name === "guide" ? (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M9.8 9.2a2.3 2.3 0 1 1 3.1 2.2c-.9.4-.9 1.1-.9 1.8M12 17h.01" />
        </>
      ) : null}
      {name === "sun" ? (
        <>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </>
      ) : null}
      {name === "moon" ? (
        <path d="M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z" />
      ) : null}
      {name === "reset" ? (
        <>
          <path d="M4 7v5h5" />
          <path d="M5.4 16.5a8 8 0 1 0 .2-9.2L4 12" />
        </>
      ) : null}
      {name === "sparkles" ? (
        <>
          <path d="m12 3 1.2 3.3L16.5 7.5l-3.3 1.2L12 12l-1.2-3.3-3.3-1.2 3.3-1.2L12 3Z" />
          <path d="m18.5 13 .7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8ZM6 14l.9 2.4 2.4.9-2.4.9L6 20.5l-.9-2.3-2.4-.9 2.4-.9L6 14Z" />
        </>
      ) : null}
      {name === "arrow" ? (
        <>
          <path d="M5 12h14M14 7l5 5-5 5" />
        </>
      ) : null}
      {name === "search" ? (
        <>
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="m15.5 15.5 4 4" />
        </>
      ) : null}
    </svg>
  );
}

const PAGE_COPY: Record<PageId, { eyebrow: string; title: string; description: string }> = {
  dashboard: {
    eyebrow: "Ringkasan toko",
    title: "Dashboard harga jual",
    description: "Lihat kondisi harga, biaya, iklan, dan langkah berikutnya dalam satu layar.",
  },
  input: {
    eyebrow: "Data utama",
    title: "Input produk & biaya",
    description: "Masukkan modal, potongan, program toko, dan biaya operasional per produk.",
  },
  category: {
    eyebrow: "Pencarian tarif",
    title: "Cari produk & biaya",
    description:
      "Cari nama produk untuk mengisi biaya administrasi dan layanan secara otomatis.",
  },
  ads: {
    eyebrow: "Performa promosi",
    title: "Kalkulator iklan",
    description: "Ukur uang yang terpakai, ROAS, ACOS, CPC, dan biaya iklan per pesanan.",
  },
  result: {
    eyebrow: "Harga aman",
    title: "Hasil & rincian",
    description: "Periksa harga jual, dana cair, titik impas, dan semua potongan per item.",
  },
  scenario: {
    eyebrow: "Penyimpanan lokal",
    title: "Skenario & referensi",
    description: "Simpan beberapa simulasi, muat kembali, atau ekspor rincian ke CSV.",
  },
};

const PAGE_MASCOT_COPY: Record<
  Exclude<PageId, "dashboard">,
  {
    eyebrow: string;
    title: string;
    description: string;
    action: string;
    target: PageId;
  }
> = {
  input: {
    eyebrow: "Kiko bantu mulai",
    title: "Catat biaya yang benar-benar keluar.",
    description:
      "Isi HPP, kemasan, operasional, voucher, dan diskon toko. Kosongkan biaya yang memang tidak ada.",
    action: "Lanjut cari produk",
    target: "category",
  },
  category: {
    eyebrow: "Pencarian pintar",
    title: "Nama produk menentukan tarif yang dipakai.",
    description:
      "Cari produk paling spesifik. Admin dan layanan akan terisi otomatis, tetapi tetap cocokkan dengan Seller Centre.",
    action: "Lanjut ke iklan",
    target: "ads",
  },
  ads: {
    eyebrow: "Kiko cek promosi",
    title: "Iklan perlu dihitung per pesanan.",
    description:
      "Masukkan dana terpakai dan jumlah pesanan agar biaya iklan tidak diam-diam menghabiskan margin.",
    action: "Lihat hasil",
    target: "result",
  },
  result: {
    eyebrow: "Ringkasan aman",
    title: "Fokus pada laba bersih, bukan omzet.",
    description:
      "Periksa dana cair, titik impas, semua potongan, dan laba per item sebelum memasang harga.",
    action: "Simpan skenario",
    target: "scenario",
  },
  scenario: {
    eyebrow: "Strategi tersimpan",
    title: "Bandingkan sebelum memilih harga.",
    description:
      "Simpan versi hemat, normal, dan agresif supaya keputusan harga tidak bergantung pada tebakan.",
    action: "Kembali ke dashboard",
    target: "dashboard",
  },
};

const CATEGORY_PRESETS = [
  {
    id: "fashion",
    icon: "PA",
    name: "Pakaian & Fashion",
    rate: 10,
    serviceRate: 8,
    range: "admin 4,25%–10%",
    examples: "Atasan, bawahan, hijab, sepatu, tas, aksesori fashion",
    note: "Kelompok fashion pada umumnya masuk tarif admin tertinggi.",
  },
  {
    id: "fmcg",
    icon: "FM",
    name: "FMCG",
    rate: 10,
    serviceRate: 6,
    range: "admin 6,5%–10%",
    examples: "Makanan, minuman, kebutuhan rumah tangga, produk harian",
    note: "Preset konservatif untuk barang konsumsi cepat habis.",
  },
  {
    id: "beauty",
    icon: "BC",
    name: "Kecantikan & Personal Care",
    rate: 10,
    serviceRate: 5.5,
    range: "9,5%–10%",
    examples: "Makeup, perawatan tubuh, rambut, parfum, skincare tertentu",
    note: "Sebagian subkategori perawatan dapat memiliki tarif berbeda.",
  },
  {
    id: "home",
    icon: "HM",
    name: "Rumah & Lifestyle",
    rate: 10,
    serviceRate: 8,
    range: "8,25%–10%",
    examples: "Dapur, dekorasi, alat rumah, hobi, alat tulis",
    note: "Gunakan 10% untuk simulasi aman jika subkategori belum diketahui.",
  },
  {
    id: "electronics",
    icon: "EL",
    name: "Elektronik & Aksesori",
    rate: 9.5,
    serviceRate: 5.5,
    range: "5,25%–9,5%",
    examples: "Aksesori ponsel, audio, komputer, kamera, perangkat elektronik",
    note: "Rentangnya lebar; perangkat high-end sering lebih rendah daripada aksesori.",
  },
  {
    id: "health",
    icon: "KS",
    name: "Kesehatan & Suplemen",
    rate: 9.5,
    serviceRate: 6,
    range: "admin 6,5%–10%",
    examples: "Vitamin, suplemen, alat kesehatan tertentu, nutrisi",
    note: "Pastikan kembali izin dan subkategori produk di Seller Centre.",
  },
  {
    id: "baby",
    icon: "IB",
    name: "Ibu, Bayi & Formula",
    rate: 9.5,
    serviceRate: 5.5,
    range: "admin 6,5%–10%",
    examples: "Susu formula, makanan bayi, perlengkapan ibu dan bayi tertentu",
    note: "Produk non-formula dapat masuk tarif subkategori yang berbeda.",
  },
  {
    id: "automotive",
    icon: "OT",
    name: "Otomotif & Perkakas",
    rate: 9.5,
    serviceRate: 7.5,
    range: "8,25%–10%",
    examples: "Aksesori kendaraan, perkakas, perawatan kendaraan",
    note: "Gunakan tarif lebih tinggi bila jenis produk belum pasti.",
  },
  {
    id: "premium",
    icon: "LM",
    name: "Logam Mulia & Premium",
    rate: 4.25,
    serviceRate: 2,
    range: "4,25%–5,25%",
    examples: "Logam mulia, perhiasan berharga, elektronik high-end tertentu",
    note: "Preset hanya untuk subkategori premium yang benar-benar sesuai.",
  },
  {
    id: "digital",
    icon: "DG",
    name: "Produk Digital",
    rate: 9.5,
    serviceRate: 5.5,
    range: "admin 8,25%–9,5%",
    examples: "E-money, tiket, voucher, dan produk digital tertentu",
    note: "Voucher dan layanan umumnya berbeda dari unit kendaraan atau barang fisik.",
  },
];

const ADMIN_RATES = [
  11.7, 10.45, 10.2, 10, 9.95, 9.5, 9, 8.25, 7.7, 7.2, 6.75, 6.5,
  6.2, 5.25, 4.7, 4.25, 4.2, 3.2, 2.5, 0,
];
const SERVICE_RATES = [
  9.5, 9, 8, 7.5, 7, 6.5, 6, 5.5, 5, 3.5, 2.5, 2, 1, 0,
];
const DEFAULT_PRODUCT =
  PRODUCT_FEES.find((product) => product.name === "Makanan Ringan") ||
  PRODUCT_FEES[0];

function HelpButton({ title, text }: { title: string; text: string }) {
  const [open, setOpen] = useState(false);
  const [popoverSide, setPopoverSide] = useState<"left" | "right">("right");
  const [popoverWidth, setPopoverWidth] = useState(240);

  return (
    <span className="help-wrap">
      <button
        aria-expanded={open}
        aria-label={`Penjelasan ${title}`}
        className="inline-help"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          const bounds = event.currentTarget.getBoundingClientRect();
          const roomRight = window.innerWidth - bounds.right - 14;
          const roomLeft = bounds.left - 14;
          const nextSide = roomRight >= roomLeft ? "right" : "left";
          const availableRoom = nextSide === "right" ? roomRight : roomLeft;
          setPopoverSide(nextSide);
          setPopoverWidth(Math.min(270, Math.max(156, availableRoom - 8)));
          setOpen((current) => !current);
        }}
        type="button"
      >
        ?
      </button>
      {open ? (
        <span
          className={`help-popover ${popoverSide}`}
          role="dialog"
          aria-label={title}
          style={{ width: `${popoverWidth}px` }}
        >
          <span>
            <strong>{title}</strong>
            <small>{text}</small>
          </span>
          <button
            aria-label="Tutup penjelasan"
            className="help-close"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setOpen(false);
            }}
            type="button"
          >
            ×
          </button>
        </span>
      ) : null}
    </span>
  );
}

function MascotArt({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`mascot-art ${className}`.trim()}
    />
  );
}

function MascotBanner({
  eyebrow,
  title,
  description,
  action,
  compact = false,
  onAction,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action: string;
  compact?: boolean;
  onAction: () => void;
}) {
  return (
    <article className={`mascot-banner ${compact ? "compact" : ""}`}>
      <span className="mascot-stage">
        <MascotArt />
        <i className="mascot-spark mascot-spark-one" />
        <i className="mascot-spark mascot-spark-two" />
      </span>
      <span className="mascot-banner-copy">
        <small>{eyebrow}</small>
        <strong>{title}</strong>
        <span>{description}</span>
      </span>
      <button onClick={onAction} type="button">
        {action}
        <AppIcon name="arrow" size={15} />
      </button>
    </article>
  );
}

function NumberField({
  label,
  value,
  onChange,
  suffix = "Rp",
  hint,
  min = 0,
  max,
  step = 1,
}: NumberFieldProps) {
  const [draft, setDraft] = useState(String(value));
  const focused = useRef(false);

  useEffect(() => {
    if (!focused.current) setDraft(String(value));
  }, [value]);

  const finishEditing = () => {
    focused.current = false;
    const parsed = Number(draft);
    const finiteValue = Number.isFinite(parsed) ? parsed : 0;
    const nextValue = Math.min(
      max ?? Number.POSITIVE_INFINITY,
      Math.max(min, finiteValue),
    );
    onChange(nextValue);
    setDraft(String(nextValue));
  };

  return (
    <label className="field">
      <span className="field-copy">
        <span className="label-line">
          <span>{label}</span>
          <HelpButton
            title={label}
            text={hint || "Masukkan nilai sesuai kondisi toko Anda."}
          />
        </span>
        {hint ? <small>{hint}</small> : null}
      </span>
      <span className="field-control">
        <span>{suffix}</span>
        <input
          aria-label={label}
          inputMode="decimal"
          min={min}
          max={max}
          step={step}
          type="number"
          value={draft}
          onFocus={() => {
            focused.current = true;
          }}
          onBlur={finishEditing}
          onChange={(event) => {
            const nextDraft = event.target.value;
            setDraft(nextDraft);
            if (nextDraft === "") {
              onChange(0);
              return;
            }
            const nextValue = Number(nextDraft);
            if (Number.isFinite(nextValue)) onChange(nextValue);
          }}
        />
      </span>
    </label>
  );
}

function ProductSearch({
  selected,
  sellerType,
  specialSize,
  onSelect,
}: {
  selected?: ProductFee;
  sellerType: SellerType;
  specialSize: boolean;
  onSelect: (product: ProductFee) => void;
}) {
  const [query, setQuery] = useState(selected?.name || "");
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const results = useMemo(() => searchProductFees(query), [query]);

  const choose = (product: ProductFee) => {
    setQuery(product.name);
    setOpen(false);
    setHighlighted(0);
    onSelect(product);
  };

  return (
    <section className="product-search-card panel">
      <div className="product-search-heading">
        <span className="search-symbol">
          <AppIcon name="search" size={21} />
        </span>
        <span>
          <strong>Cari nama produk</strong>
          <small>
            Ketik produk, misalnya “mukena”, “skincare”, “laptop”, atau
            “makanan ringan”.
          </small>
        </span>
        <b>{PRODUCT_FEES.length} pilihan</b>
      </div>

      <div className="product-search-box">
        <AppIcon name="search" size={19} />
        <input
          aria-autocomplete="list"
          aria-controls="product-fee-results"
          aria-expanded={open}
          aria-label="Cari produk dan biaya Shopee"
          autoComplete="off"
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            setHighlighted(0);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setOpen(true);
              setHighlighted((current) =>
                Math.min(current + 1, Math.max(0, results.length - 1)),
              );
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setHighlighted((current) => Math.max(0, current - 1));
            } else if (event.key === "Enter" && results[highlighted]) {
              event.preventDefault();
              choose(results[highlighted]);
            } else if (event.key === "Escape") {
              setOpen(false);
            }
          }}
          placeholder="Cari produk atau subkategori…"
          role="combobox"
          type="search"
          value={query}
        />
        {query ? (
          <button
            aria-label="Hapus pencarian"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              setQuery("");
              setOpen(true);
              setHighlighted(0);
            }}
            type="button"
          >
            ×
          </button>
        ) : null}

        {open ? (
          <div
            className="product-search-results"
            id="product-fee-results"
            role="listbox"
          >
            {results.length ? (
              results.map((product, index) => {
                const admin =
                  sellerType === "mall"
                    ? product.adminMall
                    : product.adminRegular;
                const service = specialSize
                  ? product.serviceSpecial
                  : product.serviceRegular;

                return (
                  <button
                    aria-selected={selected?.id === product.id}
                    className={highlighted === index ? "highlighted" : ""}
                    key={product.id}
                    onMouseDown={(event) => event.preventDefault()}
                    onMouseEnter={() => setHighlighted(index)}
                    onClick={() => choose(product)}
                    role="option"
                    type="button"
                  >
                    <span>
                      <strong>{product.name}</strong>
                      <small>{product.path}</small>
                    </span>
                    <span className="result-fees">
                      <b>{admin.toLocaleString("id-ID")}% admin</b>
                      <em>{service.toLocaleString("id-ID")}% layanan</em>
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="empty-product-search">
                <strong>Produk belum ditemukan</strong>
                <small>
                  Coba nama yang lebih umum, lalu gunakan tarif manual jika
                  subkategori Shopee Anda belum tersedia.
                </small>
              </div>
            )}
          </div>
        ) : null}
      </div>

      <div className="search-reference">
        <span>Data biaya Shopee 2026</span>
        <small>
          Admin final dan layanan Gratis Ongkir XTRA dipisahkan agar tidak
          terhitung ganda atau tertukar.
        </small>
      </div>
    </section>
  );
}

function ToggleField({
  label,
  hint,
  enabled,
  onChange,
}: {
  label: string;
  hint: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="switch-field">
      <span>
        <span className="label-line">
          <strong>{label}</strong>
          <HelpButton title={label} text={hint} />
        </span>
        <small>{hint}</small>
      </span>
      <button
        aria-label={`Aktifkan atau nonaktifkan ${label}`}
        aria-pressed={enabled}
        className={`switch ${enabled ? "on" : ""}`}
        onClick={() => onChange(!enabled)}
        type="button"
      >
        <i />
      </button>
    </div>
  );
}

function ResultRow({
  label,
  value,
  tone = "cost",
  help,
}: {
  label: string;
  value: number;
  tone?: "cost" | "income" | "profit";
  help?: string;
}) {
  return (
    <div className={`result-row ${tone}`}>
      <span>
        {label}
        {help ? <HelpButton title={label} text={help} /> : null}
      </span>
      <strong>
        {tone === "cost" && value > 0 ? "−" : ""}
        {rupiah.format(Math.abs(value))}
      </strong>
    </div>
  );
}

function SectionHeading({
  step,
  title,
  description,
  help,
}: {
  step?: string;
  title: string;
  description?: string;
  help?: string;
}) {
  return (
    <div className="section-heading">
      <div>
        {step ? <span className="step">{step}</span> : null}
        <span>
          <span className="label-line">
            <h2>{title}</h2>
            {help ? <HelpButton title={title} text={help} /> : null}
          </span>
          {description ? <p>{description}</p> : null}
        </span>
      </div>
    </div>
  );
}

export default function Home() {
  const [activePage, setActivePage] = useState<PageId>("dashboard");
  const [theme, setTheme] = useState<Theme>("dark");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [mode, setMode] = useState<PriceMode>("auto");
  const [sellerType, setSellerType] = useState<SellerType>("nonstar");
  const [newSellerExempt, setNewSellerExempt] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(
    DEFAULT_PRODUCT.groupId,
  );
  const [selectedProductId, setSelectedProductId] = useState(
    DEFAULT_PRODUCT.id,
  );
  const [adminRate, setAdminRate] = useState(DEFAULT_PRODUCT.adminRegular);

  const [hpp, setHpp] = useState(16350);
  const [packing, setPacking] = useState(900);
  const [operational, setOperational] = useState(500);
  const [otherCost, setOtherCost] = useState(0);
  const [manualPrice, setManualPrice] = useState(37500);
  const [targetMargin, setTargetMargin] = useState(25);
  const [rounding, setRounding] = useState(500);
  const [quantity, setQuantity] = useState(1);
  const [productDiscount, setProductDiscount] = useState(0);
  const [voucher, setVoucher] = useState(0);

  const [freeShippingEnabled, setFreeShippingEnabled] = useState(true);
  const [freeShippingRate, setFreeShippingRate] = useState(
    DEFAULT_PRODUCT.serviceRegular,
  );
  const [specialSize, setSpecialSize] = useState(false);
  const [promoEnabled, setPromoEnabled] = useState(false);
  const [affiliateRate, setAffiliateRate] = useState(3);
  const [affiliateVatEnabled, setAffiliateVatEnabled] = useState(true);
  const [affiliateVatRate, setAffiliateVatRate] = useState(11);
  const [premiumRate, setPremiumRate] = useState(0);
  const [returnReserveRate, setReturnReserveRate] = useState(0);
  const [preorderEnabled, setPreorderEnabled] = useState(false);
  const [processEnabled, setProcessEnabled] = useState(true);
  const [pphEnabled, setPphEnabled] = useState(true);
  const [liveEnabled, setLiveEnabled] = useState(false);
  const [livePrice, setLivePrice] = useState(29000);

  const [adDailyBudget, setAdDailyBudget] = useState(25000);
  const [adDays, setAdDays] = useState(7);
  const [adActualSpend, setAdActualSpend] = useState(150000);
  const [adRevenue, setAdRevenue] = useState(1250000);
  const [adOrders, setAdOrders] = useState(25);
  const [adClicks, setAdClicks] = useState(320);
  const [adImpressions, setAdImpressions] = useState(18000);
  const [allocateAds, setAllocateAds] = useState(true);

  const [savedScenarios, setSavedScenarios] = useState<Scenario[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = window.localStorage.getItem("kalkulator-cuan-scenarios");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [toast, setToast] = useState("");

  const currentCategory =
    CATEGORY_PRESETS.find((item) => item.id === selectedCategory) ||
    CATEGORY_PRESETS[1];
  const currentProduct = PRODUCT_FEES.find(
    (product) => product.id === selectedProductId,
  );

  const adBudgetTotal = adDailyBudget * Math.max(1, adDays);
  const adCostPerOrder = adOrders > 0 ? adActualSpend / adOrders : 0;
  const adRoas = adActualSpend > 0 ? adRevenue / adActualSpend : 0;
  const adAcos = adRevenue > 0 ? (adActualSpend / adRevenue) * 100 : 0;
  const adCpc = adClicks > 0 ? adActualSpend / adClicks : 0;
  const adCpm =
    adImpressions > 0 ? (adActualSpend / adImpressions) * 1000 : 0;
  const adConversion = adClicks > 0 ? (adOrders / adClicks) * 100 : 0;
  const allocatedAdCost = allocateAds ? adCostPerOrder : 0;
  const effectiveAdminRate =
    sellerType === "nonstar" && newSellerExempt && !promoEnabled ? 0 : adminRate;

  const navigate = (page: PageId) => {
    setActivePage(page);
    if (typeof window !== "undefined") {
      window.history.pushState({}, "", `#${page}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const applyHash = () => {
      const page = window.location.hash.replace("#", "") as PageId;
      if (NAV_ITEMS.some((item) => item.id === page)) setActivePage(page);
    };
    applyHash();
    window.addEventListener("popstate", applyHash);
    window.addEventListener("hashchange", applyHash);
    return () => {
      window.removeEventListener("popstate", applyHash);
      window.removeEventListener("hashchange", applyHash);
    };
  }, []);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(
      "kalkulator-cuan-theme",
    ) as Theme | null;
    const preferredTheme = savedTheme || "dark";
    const timer = window.setTimeout(() => {
      setTheme(preferredTheme);
      if (!window.localStorage.getItem("kalkulator-cuan-onboarding-v2")) {
        setShowOnboarding(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("kalkulator-cuan-theme", theme);
  }, [theme]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const closeOnboarding = (startInput = false) => {
    window.localStorage.setItem("kalkulator-cuan-onboarding-v2", "done");
    setShowOnboarding(false);
    setOnboardingStep(0);
    if (startInput) navigate("input");
  };

  const openOnboarding = () => {
    setOnboardingStep(0);
    setShowOnboarding(true);
  };

  const getCalculation = (price: number) => {
    const safeQuantity = Math.max(1, quantity);
    const netSale = Math.max(0, price - productDiscount - voucher);
    const admin = netSale * (effectiveAdminRate / 100);
    const freeShippingCap = specialSize ? 60000 : 40000;
    const freeShipping = freeShippingEnabled
      ? Math.min(netSale * (freeShippingRate / 100), freeShippingCap)
      : 0;
    const promo = promoEnabled ? Math.min(netSale * 0.065, 80000) : 0;
    const affiliateBase = netSale * (affiliateRate / 100);
    const affiliateVat = affiliateVatEnabled
      ? affiliateBase * (affiliateVatRate / 100)
      : 0;
    const affiliate = affiliateBase + affiliateVat;
    const mallPayment =
      sellerType === "mall" ? Math.min(netSale * 0.018, 50000) : 0;
    const preorder = preorderEnabled ? netSale * 0.03 : 0;
    const premium = netSale * (premiumRate / 100);
    const process = processEnabled ? 1250 / safeQuantity : 0;
    const pph = pphEnabled ? netSale * 0.005 : 0;
    const ads = allocatedAdCost;
    const returnReserve = netSale * (returnReserveRate / 100);
    const sellerCosts =
      hpp + packing + operational + otherCost + ads + returnReserve;
    const platformCuts =
      admin +
      freeShipping +
      promo +
      affiliate +
      mallPayment +
      preorder +
      premium +
      process +
      pph;
    const totalCost = platformCuts + sellerCosts;
    const payout = netSale - platformCuts;
    const profit = netSale - totalCost;

    return {
      price,
      netSale,
      admin,
      freeShipping,
      promo,
      affiliateBase,
      affiliateVat,
      affiliate,
      mallPayment,
      preorder,
      premium,
      process,
      pph,
      ads,
      returnReserve,
      sellerCosts,
      platformCuts,
      totalCost,
      payout,
      profit,
    };
  };

  const solvePrice = (margin: number) => {
    let low = Math.max(
      100,
      hpp + packing + operational + otherCost + allocatedAdCost,
    );
    let high = 1_000_000_000;
    for (let index = 0; index < 80; index += 1) {
      const mid = (low + high) / 2;
      const calculation = getCalculation(mid);
      const targetProfit = mid * (margin / 100);
      if (calculation.profit < targetProfit) low = mid;
      else high = mid;
    }
    return Math.ceil(high / Math.max(1, rounding)) * Math.max(1, rounding);
  };

  const recommendedPrice = useMemo(
    () => solvePrice(targetMargin),
    // Recalculate when any pricing input changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      hpp,
      packing,
      operational,
      otherCost,
      quantity,
      productDiscount,
      voucher,
      effectiveAdminRate,
      freeShippingEnabled,
      freeShippingRate,
      specialSize,
      promoEnabled,
      affiliateRate,
      affiliateVatEnabled,
      affiliateVatRate,
      sellerType,
      preorderEnabled,
      premiumRate,
      processEnabled,
      pphEnabled,
      allocatedAdCost,
      returnReserveRate,
      targetMargin,
      rounding,
    ],
  );

  const breakEvenPrice = useMemo(
    () => solvePrice(0),
    // Recalculate when any pricing input changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      hpp,
      packing,
      operational,
      otherCost,
      quantity,
      productDiscount,
      voucher,
      effectiveAdminRate,
      freeShippingEnabled,
      freeShippingRate,
      specialSize,
      promoEnabled,
      affiliateRate,
      affiliateVatEnabled,
      affiliateVatRate,
      sellerType,
      preorderEnabled,
      premiumRate,
      processEnabled,
      pphEnabled,
      allocatedAdCost,
      returnReserveRate,
      rounding,
    ],
  );

  const sellingPrice = mode === "auto" ? recommendedPrice : manualPrice;
  const result = getCalculation(sellingPrice);
  const liveResult = getCalculation(livePrice);
  const marketplacePercent =
    result.netSale > 0 ? (result.platformCuts / result.netSale) * 100 : 0;
  const sellerCostPercent =
    result.netSale > 0 ? (result.sellerCosts / result.netSale) * 100 : 0;
  const profitPercent =
    result.price > 0 ? (result.profit / result.price) * 100 : 0;
  const completeness = [
    hpp > 0,
    selectedCategory.length > 0,
    adminRate >= 0,
    !allocateAds || adOrders > 0,
    targetMargin > 0 || mode === "manual",
  ].filter(Boolean).length;

  const applyProduct = (product: ProductFee) => {
    setSelectedProductId(product.id);
    setSelectedCategory(product.groupId);
    setAdminRate(
      sellerType === "mall" ? product.adminMall : product.adminRegular,
    );
    setFreeShippingRate(
      specialSize ? product.serviceSpecial : product.serviceRegular,
    );
    setToast(`${product.name} diterapkan`);
  };

  const changeSellerType = (nextSellerType: SellerType) => {
    setSellerType(nextSellerType);
    if (currentProduct) {
      setAdminRate(
        nextSellerType === "mall"
          ? currentProduct.adminMall
          : currentProduct.adminRegular,
      );
    }
  };

  const changeSpecialSize = (nextSpecialSize: boolean) => {
    setSpecialSize(nextSpecialSize);
    if (currentProduct) {
      setFreeShippingRate(
        nextSpecialSize
          ? currentProduct.serviceSpecial
          : currentProduct.serviceRegular,
      );
    }
  };

  const applyCategory = (
    id: string,
    rate: number,
    serviceRate: number,
  ) => {
    setSelectedProductId("");
    setSelectedCategory(id);
    setAdminRate(rate);
    setFreeShippingRate(serviceRate);
    setToast("Preset kategori diterapkan");
  };

  const reset = () => {
    setMode("auto");
    setSellerType("nonstar");
    setNewSellerExempt(false);
    setSelectedCategory(DEFAULT_PRODUCT.groupId);
    setSelectedProductId(DEFAULT_PRODUCT.id);
    setAdminRate(DEFAULT_PRODUCT.adminRegular);
    setHpp(16350);
    setPacking(900);
    setOperational(500);
    setOtherCost(0);
    setManualPrice(37500);
    setTargetMargin(25);
    setRounding(500);
    setQuantity(1);
    setProductDiscount(0);
    setVoucher(0);
    setFreeShippingEnabled(true);
    setFreeShippingRate(DEFAULT_PRODUCT.serviceRegular);
    setSpecialSize(false);
    setPromoEnabled(false);
    setAffiliateRate(3);
    setAffiliateVatEnabled(true);
    setAffiliateVatRate(11);
    setPremiumRate(0);
    setReturnReserveRate(0);
    setPreorderEnabled(false);
    setProcessEnabled(true);
    setPphEnabled(true);
    setLiveEnabled(false);
    setLivePrice(29000);
    setAdDailyBudget(25000);
    setAdDays(7);
    setAdActualSpend(150000);
    setAdRevenue(1250000);
    setAdOrders(25);
    setAdClicks(320);
    setAdImpressions(18000);
    setAllocateAds(true);
    setToast("Semua input berhasil direset");
  };

  const getScenarioData = () => ({
    mode,
    sellerType,
    newSellerExempt,
    selectedCategory,
    selectedProductId,
    adminRate,
    hpp,
    packing,
    operational,
    otherCost,
    manualPrice,
    targetMargin,
    rounding,
    quantity,
    productDiscount,
    voucher,
    freeShippingEnabled,
    freeShippingRate,
    specialSize,
    promoEnabled,
    affiliateRate,
    affiliateVatEnabled,
    affiliateVatRate,
    premiumRate,
    returnReserveRate,
    preorderEnabled,
    processEnabled,
    pphEnabled,
    liveEnabled,
    livePrice,
    adDailyBudget,
    adDays,
    adActualSpend,
    adRevenue,
    adOrders,
    adClicks,
    adImpressions,
    allocateAds,
  });

  const saveScenario = () => {
    const next: Scenario = {
      id: `${Date.now()}`,
      name: `${currentProduct?.name || currentCategory.name} ${
        savedScenarios.length + 1
      }`,
      savedAt: new Date().toISOString(),
      data: getScenarioData(),
    };
    const updated = [...savedScenarios, next].slice(-8);
    setSavedScenarios(updated);
    try {
      window.localStorage.setItem(
        "kalkulator-cuan-scenarios",
        JSON.stringify(updated),
      );
    } catch {
      // Local saving is an enhancement.
    }
    setToast(`${next.name} tersimpan`);
  };

  const loadScenario = (scenarioId: string) => {
    const scenario = savedScenarios.find((item) => item.id === scenarioId);
    if (!scenario) return;
    const data = scenario.data;
    const numberValue = (key: string, fallback: number) => {
      const value = Number(data[key]);
      return Number.isFinite(value) ? value : fallback;
    };
    const booleanValue = (key: string, fallback: boolean) =>
      typeof data[key] === "boolean" ? Boolean(data[key]) : fallback;

    setMode((data.mode as PriceMode) || "auto");
    setSellerType((data.sellerType as SellerType) || "nonstar");
    setNewSellerExempt(booleanValue("newSellerExempt", false));
    setSelectedCategory(String(data.selectedCategory || "fmcg"));
    setSelectedProductId(String(data.selectedProductId || ""));
    setAdminRate(numberValue("adminRate", 10));
    setHpp(numberValue("hpp", 16350));
    setPacking(numberValue("packing", 900));
    setOperational(numberValue("operational", 500));
    setOtherCost(numberValue("otherCost", 0));
    setManualPrice(numberValue("manualPrice", 37500));
    setTargetMargin(numberValue("targetMargin", 25));
    setRounding(numberValue("rounding", 500));
    setQuantity(numberValue("quantity", 1));
    setProductDiscount(numberValue("productDiscount", 0));
    setVoucher(numberValue("voucher", 0));
    setFreeShippingEnabled(booleanValue("freeShippingEnabled", true));
    setFreeShippingRate(numberValue("freeShippingRate", 6));
    setSpecialSize(booleanValue("specialSize", false));
    setPromoEnabled(booleanValue("promoEnabled", false));
    setAffiliateRate(numberValue("affiliateRate", 3));
    setAffiliateVatEnabled(booleanValue("affiliateVatEnabled", true));
    setAffiliateVatRate(numberValue("affiliateVatRate", 11));
    setPremiumRate(numberValue("premiumRate", 0));
    setReturnReserveRate(numberValue("returnReserveRate", 0));
    setPreorderEnabled(booleanValue("preorderEnabled", false));
    setProcessEnabled(booleanValue("processEnabled", true));
    setPphEnabled(booleanValue("pphEnabled", true));
    setLiveEnabled(booleanValue("liveEnabled", false));
    setLivePrice(numberValue("livePrice", 29000));
    setAdDailyBudget(numberValue("adDailyBudget", 25000));
    setAdDays(numberValue("adDays", 7));
    setAdActualSpend(numberValue("adActualSpend", 150000));
    setAdRevenue(numberValue("adRevenue", 1250000));
    setAdOrders(numberValue("adOrders", 25));
    setAdClicks(numberValue("adClicks", 320));
    setAdImpressions(numberValue("adImpressions", 18000));
    setAllocateAds(booleanValue("allocateAds", true));
    setToast(`${scenario.name} dimuat`);
    navigate("dashboard");
  };

  const deleteScenario = (scenarioId: string) => {
    const updated = savedScenarios.filter((item) => item.id !== scenarioId);
    setSavedScenarios(updated);
    try {
      window.localStorage.setItem(
        "kalkulator-cuan-scenarios",
        JSON.stringify(updated),
      );
    } catch {
      // Local saving is an enhancement.
    }
    setToast("Skenario dihapus");
  };

  const exportCsv = () => {
    const rows = [
      ["Komponen", "Nilai per item"],
      ["Produk", currentProduct?.name || "Preset kategori umum"],
      ["Kategori", currentCategory.name],
      ["Tarif admin", `${effectiveAdminRate}%`],
      ["Tarif layanan Gratis Ongkir XTRA", `${freeShippingRate}%`],
      ["Harga jual", result.price],
      ["Net sale", result.netSale],
      ["HPP", hpp],
      ["Kemasan", packing],
      ["Operasional", operational],
      ["Biaya administrasi", result.admin],
      ["Gratis Ongkir XTRA", result.freeShipping],
      ["Promo XTRA+", result.promo],
      ["Affiliate / AMS", result.affiliate],
      ["Biaya pembayaran Mall", result.mallPayment],
      ["Biaya pre-order", result.preorder],
      ["Biaya proses pesanan", result.process],
      ["PPh Pasal 22", result.pph],
      ["Alokasi iklan per pesanan", result.ads],
      ["Cadangan retur", result.returnReserve],
      ["Laba bersih", result.profit],
      ["ROAS iklan", adRoas.toFixed(2)],
      ["ACOS iklan", `${adAcos.toFixed(2)}%`],
    ];
    const csv = rows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "simulasi-harga-shopee.csv";
    anchor.click();
    URL.revokeObjectURL(url);
    setToast("Rincian CSV berhasil dibuat");
  };

  const pageCopy = PAGE_COPY[activePage];
  const onboarding = ONBOARDING_STEPS[onboardingStep];

  return (
    <div className="app-root" data-theme={theme}>
      {toast ? <div className="toast">{toast}</div> : null}
      {showOnboarding ? (
        <div
          className="onboarding-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Panduan penggunaan aplikasi"
        >
          <article className="onboarding-card">
            <header>
              <span className="onboarding-brand">
                <AppIcon name="calculator" size={19} />
              </span>
              <button onClick={() => closeOnboarding()} type="button">
                Lewati
              </button>
            </header>
            <div className="onboarding-visual">
              <MascotArt className="onboarding-mascot" />
              <span className="onboarding-step-icon">
                <AppIcon name={onboarding.icon} size={31} />
              </span>
              <i />
              <i />
            </div>
            <p className="onboarding-eyebrow">{onboarding.eyebrow}</p>
            <h2>{onboarding.title}</h2>
            <p>{onboarding.description}</p>
            <div className="onboarding-tip">
              <AppIcon name="sparkles" size={16} />
              <span>{onboarding.detail}</span>
            </div>
            <footer>
              <div className="onboarding-dots" aria-label="Posisi panduan">
                {ONBOARDING_STEPS.map((step, index) => (
                  <i
                    className={index === onboardingStep ? "active" : ""}
                    key={step.title}
                  />
                ))}
              </div>
              {onboardingStep < ONBOARDING_STEPS.length - 1 ? (
                <button
                  className="onboarding-next"
                  onClick={() => setOnboardingStep((current) => current + 1)}
                  type="button"
                >
                  Lanjut
                  <AppIcon name="arrow" size={16} />
                </button>
              ) : (
                <button
                  className="onboarding-next"
                  onClick={() => closeOnboarding(true)}
                  type="button"
                >
                  Mulai isi data
                  <AppIcon name="arrow" size={16} />
                </button>
              )}
            </footer>
          </article>
        </div>
      ) : null}

      <aside className="desktop-sidebar" aria-label="Navigasi aplikasi">
        <button
          className="brand"
          onClick={() => navigate("dashboard")}
          type="button"
        >
          <span className="brand-mark mascot-brand" aria-hidden="true" />
          <span>
            <strong>Kalkulator Cuan</strong>
            <small>Kiko · Shopee pricing</small>
          </span>
        </button>

        <nav>
          {NAV_ITEMS.map((item) => (
            <button
              aria-current={activePage === item.id ? "page" : undefined}
              className={activePage === item.id ? "active" : ""}
              key={item.id}
              onClick={() => navigate(item.id)}
              type="button"
            >
              <span>
                <AppIcon name={item.icon} size={17} />
              </span>
              {item.label}
            </button>
          ))}
        </nav>

        <button className="sidebar-guide" onClick={openOnboarding} type="button">
          <MascotArt className="sidebar-mascot" />
          <span>
            <strong>Tanya Kiko</strong>
            <small>Ulangi panduan penggunaan</small>
          </span>
        </button>

        <div className="sidebar-result">
          <span>Harga aman saat ini</span>
          <strong>{rupiah.format(sellingPrice)}</strong>
          <small>
            {currentProduct?.name || currentCategory.name} · Admin{" "}
            {effectiveAdminRate}% · Layanan {freeShippingRate}%
          </small>
          <button onClick={() => navigate("result")} type="button">
            Buka hasil
          </button>
        </div>
      </aside>

      <main className="app-shell">
        <header className="topbar">
          <div className="mobile-brand">
            <span className="brand-mark mascot-brand" aria-hidden="true" />
            <span>
              <strong>{pageCopy.title}</strong>
              <small>Kiko · Kalkulator Shopee</small>
            </span>
          </div>

          <div className="desktop-page-title">
            <p className="eyebrow">{pageCopy.eyebrow}</p>
            <h1>{pageCopy.title}</h1>
          </div>

          <div className="topbar-actions">
            <span className="verified-pill">
              <i />
              Data dicek 26 Jul 2026
            </span>
            <button
              className="icon-action guide-action"
              onClick={openOnboarding}
              type="button"
              aria-label="Buka panduan"
            >
              <AppIcon name="guide" size={17} />
              <span>Panduan</span>
            </button>
            <button
              className="ghost-button save-action"
              onClick={saveScenario}
              type="button"
            >
              <AppIcon name="save" size={15} />
              Simpan
            </button>
            <button
              aria-label={`Aktifkan mode ${theme === "dark" ? "terang" : "gelap"}`}
              className="icon-action theme-action"
              onClick={() =>
                setTheme((current) => (current === "dark" ? "light" : "dark"))
              }
              type="button"
            >
              <AppIcon name={theme === "dark" ? "sun" : "moon"} size={17} />
            </button>
            <button className="dark-button" onClick={reset} type="button">
              <AppIcon name="reset" size={15} />
              <span>Reset</span>
            </button>
          </div>
        </header>

        <div className="page-intro">
          <div>
            <p className="eyebrow">{pageCopy.eyebrow}</p>
            <h1>{pageCopy.title}</h1>
            <p>{pageCopy.description}</p>
          </div>
          <div className="page-progress" aria-label="Kelengkapan input">
            <span>{completeness}/5 data penting siap</span>
            <i>
              <b style={{ width: `${(completeness / 5) * 100}%` }} />
            </i>
          </div>
        </div>

        {activePage !== "dashboard" ? (
          <MascotBanner
            compact
            eyebrow={PAGE_MASCOT_COPY[activePage].eyebrow}
            title={PAGE_MASCOT_COPY[activePage].title}
            description={PAGE_MASCOT_COPY[activePage].description}
            action={PAGE_MASCOT_COPY[activePage].action}
            onAction={() => navigate(PAGE_MASCOT_COPY[activePage].target)}
          />
        ) : null}

        {activePage === "dashboard" ? (
          <section className="app-page dashboard-page">
            <MascotBanner
              eyebrow="Kiko · Teman hitung harga"
              title="Harga aman bukan sekadar menaikkan HPP."
              description={`Saya bantu menghitung ${currentProduct?.name || currentCategory.name}, admin ${effectiveAdminRate}%, layanan ${freeShippingRate}%, iklan, voucher, dan biaya toko sampai laba bersihnya terlihat.`}
              action="Mulai hitung"
              onAction={() => navigate("input")}
            />

            <article className="getting-started-strip">
              <span className="getting-started-icon">
                <AppIcon name="sparkles" size={19} />
              </span>
              <div>
                <strong>Baru pertama kali menghitung?</strong>
                <small>
                  Ikuti urutan Input → Kategori → Iklan → Hasil. Angka awal
                  hanya contoh dan bisa langsung diganti.
                </small>
              </div>
              <button onClick={openOnboarding} type="button">
                Lihat panduan
              </button>
              <button onClick={() => navigate("input")} type="button">
                Mulai input
                <AppIcon name="arrow" size={15} />
              </button>
            </article>

            <article className="dashboard-hero">
              <div>
                <span className="hero-kicker">Rekomendasi harga jual</span>
                <strong className="dashboard-price">
                  {rupiah.format(sellingPrice)}
                </strong>
                <span className={`profit-badge ${result.profit < 0 ? "loss" : ""}`}>
                  Laba {rupiah.format(result.profit)} · {profitPercent.toFixed(1)}%
                </span>
              </div>
              <div className="hero-side">
                <span>Produk aktif</span>
                <strong>{currentProduct?.name || currentCategory.name}</strong>
                <small>
                  Admin {effectiveAdminRate}% · Layanan {freeShippingRate}% · Iklan{" "}
                  {rupiah.format(allocatedAdCost)}/pesanan
                </small>
                <button onClick={() => navigate("result")} type="button">
                  Lihat hasil lengkap
                </button>
              </div>
            </article>

            <section className="dashboard-metrics">
              <article>
                <span>Dana cair</span>
                <strong>{rupiah.format(result.payout)}</strong>
                <small>Setelah potongan platform</small>
              </article>
              <article>
                <span>Total potongan</span>
                <strong>{marketplacePercent.toFixed(1)}%</strong>
                <small>{rupiah.format(result.platformCuts)}</small>
              </article>
              <article>
                <span>Titik impas</span>
                <strong>{rupiah.format(breakEvenPrice)}</strong>
                <small>Harga minimum agar tidak rugi</small>
              </article>
              <article>
                <span>ROAS iklan</span>
                <strong>{adRoas.toFixed(2)}×</strong>
                <small>ACOS {adAcos.toFixed(1)}%</small>
              </article>
            </section>

            <MascotBanner
              compact
              eyebrow="Jangan salah kategori"
              title={`${currentProduct?.name || currentCategory.name} memakai admin ${effectiveAdminRate}% dan layanan ${freeShippingRate}%.`}
              description="Tarif antar-subkategori bisa berbeda. Cari nama produk yang paling spesifik sebelum memakai hasil."
              action="Periksa produk"
              onAction={() => navigate("category")}
            />

            <section className="dashboard-grid">
              <article className="panel task-panel">
                <SectionHeading
                  title="Mulai dari mana?"
                  description="Selesaikan tiap langkah secara berurutan."
                  help="Setiap tombol membuka halaman kerja tersendiri. Data tetap tersimpan selama aplikasi terbuka."
                />
                <div className="task-list">
                  {[
                    {
                      page: "input" as PageId,
                      number: "01",
                      title: "Isi modal & biaya",
                      text: "HPP, kemasan, voucher, dan program toko",
                      done: hpp > 0,
                    },
                    {
                      page: "category" as PageId,
                      number: "02",
                      title: "Cari produk & kategori",
                      text: `${
                        currentProduct?.name || currentCategory.name
                      } · admin ${adminRate}% · layanan ${freeShippingRate}%`,
                      done: Boolean(selectedCategory),
                    },
                    {
                      page: "ads" as PageId,
                      number: "03",
                      title: "Masukkan performa iklan",
                      text: `${rupiah.format(adActualSpend)} terpakai`,
                      done: !allocateAds || adOrders > 0,
                    },
                    {
                      page: "result" as PageId,
                      number: "04",
                      title: "Periksa harga aman",
                      text: "Cek laba dan seluruh potongan per item",
                      done: true,
                    },
                  ].map((item) => (
                    <button
                      key={item.page}
                      onClick={() => navigate(item.page)}
                      type="button"
                    >
                      <span>{item.number}</span>
                      <span>
                        <strong>{item.title}</strong>
                        <small>{item.text}</small>
                      </span>
                      <b className={item.done ? "done" : ""}>
                        {item.done ? "✓" : "→"}
                      </b>
                    </button>
                  ))}
                </div>
              </article>

              <article className="panel overview-panel">
                <SectionHeading
                  title="Komposisi biaya"
                  description="Per item pada harga jual saat ini."
                  help="Platform adalah potongan Shopee. Biaya penjual mencakup HPP, operasional, retur, dan alokasi iklan."
                />
                <div className="cost-stack">
                  <span
                    className="platform"
                    style={{
                      width: `${Math.min(
                        100,
                        (result.platformCuts / Math.max(1, result.totalCost)) * 100,
                      )}%`,
                    }}
                  />
                  <span
                    className="seller"
                    style={{
                      width: `${Math.min(
                        100,
                        (result.sellerCosts / Math.max(1, result.totalCost)) * 100,
                      )}%`,
                    }}
                  />
                </div>
                <div className="legend-list">
                  <span>
                    <i className="platform" />
                    Potongan platform
                    <strong>{rupiah.format(result.platformCuts)}</strong>
                  </span>
                  <span>
                    <i className="seller" />
                    Biaya penjual
                    <strong>{rupiah.format(result.sellerCosts)}</strong>
                  </span>
                  <span>
                    <i className="profit" />
                    Laba bersih
                    <strong>{rupiah.format(result.profit)}</strong>
                  </span>
                </div>
                <button
                  className="wide-secondary"
                  onClick={() => navigate("scenario")}
                  type="button"
                >
                  Kelola skenario tersimpan
                </button>
              </article>
            </section>
          </section>
        ) : null}

        {activePage === "input" ? (
          <section className="app-page">
            <div className="two-column-page">
              <article className="panel form-panel">
                <SectionHeading
                  step="01"
                  title="Produk & target"
                  description="Data paling penting untuk menentukan harga."
                  help="Mode otomatis mencari harga yang memenuhi target margin. Mode manual mengecek keuntungan dari harga yang Anda tentukan."
                />

                <div className="segmented large" aria-label="Mode harga">
                  <button
                    className={mode === "auto" ? "active" : ""}
                    onClick={() => setMode("auto")}
                    type="button"
                  >
                    Harga otomatis
                  </button>
                  <button
                    className={mode === "manual" ? "active" : ""}
                    onClick={() => setMode("manual")}
                    type="button"
                  >
                    Uji harga manual
                  </button>
                </div>

                <label className="select-field">
                  <span>
                    <span className="label-line">
                      <strong>Status penjual</strong>
                      <HelpButton
                        title="Status penjual"
                        text="Shopee Mall memiliki biaya pembayaran tambahan 1,8% dengan batas Rp50.000 per kuantitas."
                      />
                    </span>
                    <small>Pilih status toko aktif saat ini</small>
                  </span>
                  <select
                    value={sellerType}
                    onChange={(event) =>
                      changeSellerType(event.target.value as SellerType)
                    }
                  >
                    <option value="nonstar">Non-Star</option>
                    <option value="star">Star / Star+</option>
                    <option value="mall">Shopee Mall</option>
                  </select>
                </label>

                {sellerType === "nonstar" ? (
                  <ToggleField
                    label="Toko baru bebas admin"
                    hint="Aktifkan hanya jika toko masih memenuhi ketentuan bebas admin. Promo XTRA+ dapat membuat biaya admin tetap berlaku."
                    enabled={newSellerExempt}
                    onChange={setNewSellerExempt}
                  />
                ) : null}

                <NumberField
                  label="Harga modal (HPP)"
                  hint="Harga beli atau biaya produksi satu item"
                  value={hpp}
                  onChange={setHpp}
                />
                {mode === "auto" ? (
                  <NumberField
                    label="Target margin bersih"
                    hint="Persentase laba dari harga jual"
                    suffix="%"
                    value={targetMargin}
                    onChange={setTargetMargin}
                    max={70}
                    step={0.5}
                  />
                ) : (
                  <NumberField
                    label="Harga jual toko"
                    hint="Harga sebelum diskon dan voucher"
                    value={manualPrice}
                    onChange={setManualPrice}
                  />
                )}
                <NumberField
                  label="Pembulatan harga"
                  hint="Contoh Rp500 menghasilkan harga Rp37.500"
                  value={rounding}
                  onChange={setRounding}
                  min={1}
                />
                <NumberField
                  label="Diskon produk"
                  hint="Potongan harga yang ditanggung toko per item"
                  value={productDiscount}
                  onChange={setProductDiscount}
                />
                <NumberField
                  label="Voucher penjual"
                  hint="Nilai voucher yang ditanggung toko per item"
                  value={voucher}
                  onChange={setVoucher}
                />
              </article>

              <div className="stacked-panels">
                <article className="panel form-panel">
                  <SectionHeading
                    step="02"
                    title="Operasional per item"
                    description="Biaya yang sering terlupa saat menentukan harga."
                    help="Bagi biaya bulanan dengan jumlah produk terjual untuk mendapatkan alokasi operasional per item."
                  />
                  <NumberField
                    label="Kemasan & packing"
                    hint="Plastik, kardus, bubble wrap, label"
                    value={packing}
                    onChange={setPacking}
                  />
                  <NumberField
                    label="Tenaga kerja & operasional"
                    hint="Gaji, listrik, gudang, atau handling per item"
                    value={operational}
                    onChange={setOperational}
                  />
                  <NumberField
                    label="Biaya lain-lain"
                    hint="Tambahan biaya internal per item"
                    value={otherCost}
                    onChange={setOtherCost}
                  />
                  <NumberField
                    label="Jumlah item per transaksi"
                    hint="Untuk membagi biaya proses Rp1.250"
                    suffix="Qty"
                    value={quantity}
                    onChange={setQuantity}
                    min={1}
                    max={100}
                  />
                  <NumberField
                    label="Cadangan retur & kerusakan"
                    hint="Dana pengaman internal berdasarkan net sale"
                    suffix="%"
                    value={returnReserveRate}
                    onChange={setReturnReserveRate}
                    max={30}
                    step={0.1}
                  />
                </article>

                <article className="panel form-panel">
                  <SectionHeading
                    step="03"
                    title="Program Shopee"
                    description="Aktifkan hanya program yang diikuti toko."
                    help="Setiap program menambah potongan. Periksa menu Keuangan dan Program di Seller Centre."
                  />
                  <ToggleField
                    label="Gratis Ongkir XTRA"
                    hint="Biaya sesuai kategori; batas Rp40.000 normal atau Rp60.000 ukuran khusus."
                    enabled={freeShippingEnabled}
                    onChange={setFreeShippingEnabled}
                  />
                  {freeShippingEnabled ? (
                    <>
                      <NumberField
                        label="Tarif Gratis Ongkir XTRA"
                        hint="Isi persentase yang berlaku untuk produk"
                        suffix="%"
                        value={freeShippingRate}
                        onChange={setFreeShippingRate}
                        max={20}
                        step={0.1}
                      />
                      <ToggleField
                        label="Produk ukuran khusus"
                        hint="Tarif kategori dan batas maksimum berubah menjadi skema ukuran khusus, maksimal Rp60.000 per kuantitas."
                        enabled={specialSize}
                        onChange={changeSpecialSize}
                      />
                    </>
                  ) : null}
                  <ToggleField
                    label="Promo XTRA+"
                    hint="6,5% dengan maksimum Rp80.000 per kuantitas."
                    enabled={promoEnabled}
                    onChange={setPromoEnabled}
                  />
                  <NumberField
                    label="Komisi Affiliate / AMS"
                    hint="Komisi pilihan penjual sebelum PPN"
                    suffix="%"
                    value={affiliateRate}
                    onChange={setAffiliateRate}
                    max={50}
                    step={0.1}
                  />
                  <ToggleField
                    label="PPN komisi Affiliate"
                    hint={`${affiliateVatRate}% dari nilai komisi affiliate.`}
                    enabled={affiliateVatEnabled}
                    onChange={setAffiliateVatEnabled}
                  />
                  {affiliateVatEnabled ? (
                    <NumberField
                      label="Tarif PPN komisi"
                      hint="Dapat diubah bila rincian transaksi berbeda"
                      suffix="%"
                      value={affiliateVatRate}
                      onChange={setAffiliateVatRate}
                      max={30}
                      step={0.1}
                    />
                  ) : null}
                  <ToggleField
                    label="Produk pre-order"
                    hint="Estimasi biaya layanan 3% per kuantitas."
                    enabled={preorderEnabled}
                    onChange={setPreorderEnabled}
                  />
                  <ToggleField
                    label="Biaya proses pesanan"
                    hint="Rp1.250 per transaksi selesai, dibagi jumlah item."
                    enabled={processEnabled}
                    onChange={setProcessEnabled}
                  />
                  <ToggleField
                    label="PPh Pasal 22"
                    hint="0,5% dari nilai bruto transaksi, basis simulasi mulai 1 Agustus 2026."
                    enabled={pphEnabled}
                    onChange={setPphEnabled}
                  />
                  <NumberField
                    label="Premi / proteksi"
                    hint="Isi jika biaya ini muncul pada rincian transaksi"
                    suffix="%"
                    value={premiumRate}
                    onChange={setPremiumRate}
                    max={20}
                    step={0.1}
                  />
                </article>
              </div>
            </div>

            <div className="page-actions">
              <button
                className="secondary-button"
                onClick={() => navigate("category")}
                type="button"
              >
                Lanjut pilih kategori
              </button>
              <button
                className="primary-button"
                onClick={() => navigate("result")}
                type="button"
              >
                Lihat hasil sementara
              </button>
            </div>
          </section>
        ) : null}

        {activePage === "category" ? (
          <section className="app-page">
            <ProductSearch
              key={currentProduct?.id || "manual-category"}
              selected={currentProduct}
              sellerType={sellerType}
              specialSize={specialSize}
              onSelect={applyProduct}
            />

            <article className="category-summary panel">
              <div className="category-symbol">{currentCategory.icon}</div>
              <div>
                <span>Produk & kategori terpilih</span>
                <strong>{currentProduct?.name || currentCategory.name}</strong>
                <small>
                  {currentProduct?.path || currentCategory.examples}
                </small>
              </div>
              <div className="category-rate">
                <span>Biaya otomatis dipakai</span>
                <strong>{adminRate.toLocaleString("id-ID")}%</strong>
                <small>
                  Admin · layanan{" "}
                  {freeShippingRate.toLocaleString("id-ID")}%
                </small>
              </div>
              <label>
                <span>Ubah tarif manual</span>
                <select
                  value={adminRate}
                  onChange={(event) => setAdminRate(Number(event.target.value))}
                >
                  {ADMIN_RATES.map((rate) => (
                    <option value={rate} key={rate}>
                      {rate.toLocaleString("id-ID")}%
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Ubah layanan manual</span>
                <select
                  value={freeShippingRate}
                  onChange={(event) =>
                    setFreeShippingRate(Number(event.target.value))
                  }
                >
                  {SERVICE_RATES.map((rate) => (
                    <option value={rate} key={rate}>
                      {rate.toLocaleString("id-ID")}%
                    </option>
                  ))}
                </select>
              </label>
            </article>

            <div className="notice-card">
              <span>i</span>
              <p>
                <strong>
                  Tarif mengikuti subkategori dan ukuran produk.
                </strong>
                Hasil pencarian mengisi Biaya Administrasi Final serta layanan
                Gratis Ongkir XTRA. Produk ukuran khusus memakai tarif layanan
                lebih tinggi. Cocokkan kembali dengan kategori yang tampil di
                Seller Centre bila produk Anda berada di subkategori yang sangat
                spesifik.
              </p>
            </div>

            <section className="category-grid">
              {CATEGORY_PRESETS.map((category) => (
                <button
                  className={
                    !currentProduct && selectedCategory === category.id
                      ? "selected"
                      : ""
                  }
                  key={category.id}
                  onClick={() =>
                    applyCategory(
                      category.id,
                      category.rate,
                      category.serviceRate,
                    )
                  }
                  type="button"
                >
                  <span className="category-card-top">
                    <i>{category.icon}</i>
                    <b>{category.range}</b>
                  </span>
                  <strong>{category.name}</strong>
                  <small>{category.examples}</small>
                  <span className="category-note">{category.note}</span>
                  <span className="apply-copy">
                    {!currentProduct && selectedCategory === category.id
                      ? "✓ Sedang digunakan"
                      : `Admin ${category.rate}% · layanan ${category.serviceRate}%`}
                  </span>
                </button>
              ))}
            </section>

            <div className="page-actions">
              <button
                className="secondary-button"
                onClick={() => navigate("input")}
                type="button"
              >
                Kembali ke input
              </button>
              <button
                className="primary-button"
                onClick={() => navigate("ads")}
                type="button"
              >
                Lanjut hitung iklan
              </button>
            </div>
          </section>
        ) : null}

        {activePage === "ads" ? (
          <section className="app-page">
            <div className="ads-layout">
              <article className="panel form-panel ads-input-panel">
                <SectionHeading
                  step="01"
                  title="Data kampanye"
                  description="Gunakan periode yang sama untuk semua input."
                  help="Contoh: jika mengukur 7 hari, masukkan belanja, omzet, pesanan, klik, dan tayangan untuk 7 hari yang sama."
                />
                <NumberField
                  label="Budget iklan harian"
                  hint="Batas anggaran yang Anda siapkan per hari"
                  value={adDailyBudget}
                  onChange={setAdDailyBudget}
                />
                <NumberField
                  label="Durasi kampanye"
                  hint="Jumlah hari dalam periode analisis"
                  suffix="Hari"
                  value={adDays}
                  onChange={setAdDays}
                  min={1}
                  max={365}
                />
                <NumberField
                  label="Biaya iklan terpakai"
                  hint={`Budget periode ${rupiah.format(adBudgetTotal)}`}
                  value={adActualSpend}
                  onChange={setAdActualSpend}
                />
                <NumberField
                  label="Omzet dari iklan"
                  hint="Penjualan yang diatribusikan ke iklan"
                  value={adRevenue}
                  onChange={setAdRevenue}
                />
                <NumberField
                  label="Pesanan dari iklan"
                  hint="Jumlah pesanan yang diatribusikan ke iklan"
                  suffix="Order"
                  value={adOrders}
                  onChange={setAdOrders}
                />
                <NumberField
                  label="Jumlah klik"
                  hint="Klik iklan pada periode yang sama"
                  suffix="Klik"
                  value={adClicks}
                  onChange={setAdClicks}
                />
                <NumberField
                  label="Jumlah tayangan"
                  hint="Impression iklan pada periode yang sama"
                  suffix="View"
                  value={adImpressions}
                  onChange={setAdImpressions}
                />
                <ToggleField
                  label="Masukkan iklan ke harga jual"
                  hint={`Alokasikan ${rupiah.format(adCostPerOrder)} ke setiap pesanan hasil iklan.`}
                  enabled={allocateAds}
                  onChange={setAllocateAds}
                />
              </article>

              <div className="ads-result-column">
                <article className="ad-spend-card">
                  <div>
                    <span>Biaya iklan terpakai</span>
                    <strong>{rupiah.format(adActualSpend)}</strong>
                    <small>
                      dari budget {rupiah.format(adBudgetTotal)} ·{" "}
                      {adBudgetTotal > 0
                        ? ((adActualSpend / adBudgetTotal) * 100).toFixed(1)
                        : "0.0"}
                      %
                    </small>
                  </div>
                  <span
                    className={`ad-health ${
                      adRoas >= 4 ? "good" : adRoas >= 2 ? "medium" : "bad"
                    }`}
                  >
                    {adRoas >= 4
                      ? "Efisien"
                      : adRoas >= 2
                        ? "Perlu dipantau"
                        : "Berisiko"}
                  </span>
                </article>

                <section className="ad-metric-grid">
                  <article>
                    <span>
                      ROAS
                      <HelpButton
                        title="ROAS"
                        text="Omzet dari iklan dibagi biaya iklan. Semakin tinggi, semakin banyak omzet yang dihasilkan setiap Rp1 biaya."
                      />
                    </span>
                    <strong>{adRoas.toFixed(2)}×</strong>
                    <small>Rp1 iklan menghasilkan {rupiah.format(adRoas)}</small>
                  </article>
                  <article>
                    <span>
                      ACOS
                      <HelpButton
                        title="ACOS"
                        text="Biaya iklan dibagi omzet iklan. Bandingkan dengan margin kotor; ACOS terlalu tinggi dapat membuat produk rugi."
                      />
                    </span>
                    <strong>{adAcos.toFixed(1)}%</strong>
                    <small>Porsi iklan dari omzet iklan</small>
                  </article>
                  <article>
                    <span>
                      Biaya per pesanan
                      <HelpButton
                        title="Biaya per pesanan"
                        text="Total biaya iklan dibagi jumlah pesanan yang berasal dari iklan."
                      />
                    </span>
                    <strong>{rupiah.format(adCostPerOrder)}</strong>
                    <small>Dialokasikan ke harga jika tombol aktif</small>
                  </article>
                  <article>
                    <span>
                      CPC
                      <HelpButton
                        title="CPC"
                        text="Biaya rata-rata untuk setiap klik iklan."
                      />
                    </span>
                    <strong>{rupiah.format(adCpc)}</strong>
                    <small>Biaya per klik</small>
                  </article>
                  <article>
                    <span>
                      CPM
                      <HelpButton
                        title="CPM"
                        text="Biaya rata-rata untuk setiap seribu tayangan iklan."
                      />
                    </span>
                    <strong>{rupiah.format(adCpm)}</strong>
                    <small>Biaya per 1.000 tayangan</small>
                  </article>
                  <article>
                    <span>
                      Konversi
                      <HelpButton
                        title="Konversi iklan"
                        text="Jumlah pesanan dibagi jumlah klik. Menunjukkan kemampuan halaman produk mengubah klik menjadi pesanan."
                      />
                    </span>
                    <strong>{adConversion.toFixed(1)}%</strong>
                    <small>{adOrders} pesanan dari {adClicks} klik</small>
                  </article>
                </section>

                <article className="panel ad-insight">
                  <SectionHeading
                    title="Batas aman sederhana"
                    description="Bandingkan biaya iklan dengan laba sebelum iklan."
                    help="Ini indikator praktis, bukan aturan resmi Shopee. Produk tetap perlu diuji berdasarkan target margin dan tingkat retur."
                  />
                  <div className="insight-row">
                    <span>Laba setelah alokasi iklan</span>
                    <strong>{rupiah.format(result.profit)}</strong>
                  </div>
                  <div className="insight-row">
                    <span>Alokasi iklan per pesanan</span>
                    <strong>{rupiah.format(allocatedAdCost)}</strong>
                  </div>
                  <div className="insight-message">
                    {result.profit > 0
                      ? "Harga saat ini masih menyisakan laba setelah biaya iklan."
                      : "Biaya iklan membuat harga saat ini melewati batas aman. Naikkan harga atau tekan biaya per pesanan."}
                  </div>
                </article>
              </div>
            </div>

            <div className="page-actions">
              <button
                className="secondary-button"
                onClick={() => navigate("category")}
                type="button"
              >
                Kembali ke kategori
              </button>
              <button
                className="primary-button"
                onClick={() => navigate("result")}
                type="button"
              >
                Lihat hasil akhir
              </button>
            </div>
          </section>
        ) : null}

        {activePage === "result" ? (
          <section className="app-page">
            <div className="result-layout">
              <section className="result-summary-column">
                <article className="price-card">
                  <div className="price-card-top">
                    <span className="label-line">
                      <span>
                        {mode === "auto"
                          ? "Harga jual aman"
                          : "Harga jual marketplace"}
                      </span>
                      <HelpButton
                        title="Harga jual aman"
                        text="Harga ini sudah memperhitungkan seluruh biaya aktif, alokasi iklan, dan target margin."
                      />
                    </span>
                    <span className="status-dot">● Real-time</span>
                  </div>
                  <div className="hero-price">{rupiah.format(result.price)}</div>
                  <div
                    className={`profit-chip ${result.profit < 0 ? "negative" : ""}`}
                  >
                    <span>Laba bersih</span>
                    <strong>{rupiah.format(result.profit)}</strong>
                    <em>{profitPercent.toFixed(1)}%</em>
                  </div>
                  <div className="price-card-metrics">
                    <div>
                      <span>Dana cair</span>
                      <strong>{rupiah.format(result.payout)}</strong>
                    </div>
                    <div>
                      <span>Titik impas</span>
                      <strong>{rupiah.format(breakEvenPrice)}</strong>
                    </div>
                    <div>
                      <span>Potongan platform</span>
                      <strong>{marketplacePercent.toFixed(1)}%</strong>
                    </div>
                  </div>
                </article>

                <section className="summary-grid">
                  <article>
                    <span>Produk</span>
                    <strong>{currentProduct?.name || currentCategory.name}</strong>
                    <small>
                      Admin {effectiveAdminRate}% · layanan {freeShippingRate}%
                    </small>
                  </article>
                  <article>
                    <span>Biaya penjual</span>
                    <strong>{sellerCostPercent.toFixed(1)}%</strong>
                    <small>{rupiah.format(result.sellerCosts)}</small>
                  </article>
                  <article>
                    <span>Iklan per order</span>
                    <strong>{rupiah.format(result.ads)}</strong>
                    <small>ROAS {adRoas.toFixed(2)}×</small>
                  </article>
                  <article>
                    <span>Status toko</span>
                    <strong>
                      {sellerType === "nonstar"
                        ? "Non-Star"
                        : sellerType === "star"
                          ? "Star / Star+"
                          : "Shopee Mall"}
                    </strong>
                    <small>{promoEnabled ? "Promo XTRA+ aktif" : "Promo XTRA+ nonaktif"}</small>
                  </article>
                </section>

                {liveEnabled ? (
                  <article className={`live-card ${liveResult.profit < 0 ? "loss" : ""}`}>
                    <span>Simulasi harga Live</span>
                    <strong>{rupiah.format(livePrice)}</strong>
                    <small>
                      {liveResult.profit < 0 ? "Rugi" : "Laba"}{" "}
                      {rupiah.format(liveResult.profit)}
                    </small>
                  </article>
                ) : (
                  <article className="panel live-setup">
                    <div>
                      <span className="label-line">
                        <strong>Bandingkan harga Live</strong>
                        <HelpButton
                          title="Harga Live"
                          text="Gunakan untuk mengecek apakah harga promo saat live masih di atas titik impas."
                        />
                      </span>
                      <small>Uji harga promo tanpa mengubah hasil utama</small>
                    </div>
                    <button
                      onClick={() => {
                        setLiveEnabled(true);
                        setLivePrice(Math.max(0, sellingPrice - 5000));
                      }}
                      type="button"
                    >
                      Aktifkan
                    </button>
                  </article>
                )}

                {liveEnabled ? (
                  <article className="panel live-input">
                    <NumberField
                      label="Harga jual Live"
                      hint="Harga yang dibayar pembeli saat live"
                      value={livePrice}
                      onChange={setLivePrice}
                    />
                    <button onClick={() => setLiveEnabled(false)} type="button">
                      Nonaktifkan perbandingan
                    </button>
                  </article>
                ) : null}
              </section>

              <article className="panel breakdown-panel">
                <SectionHeading
                  step="05"
                  title="Rincian per item"
                  description="Semua komponen yang membentuk laba bersih."
                  help="Nilai negatif adalah biaya atau potongan. Dana cair adalah net sale setelah potongan platform, sebelum HPP dan biaya internal."
                />
                <div className="result-list">
                  <ResultRow
                    label="Harga jual marketplace"
                    value={result.price}
                    tone="income"
                  />
                  <ResultRow label="Diskon produk" value={productDiscount} />
                  <ResultRow label="Voucher penjual" value={voucher} />
                  <div className="result-separator" />
                  <ResultRow label="Net sale" value={result.netSale} tone="income" />
                  <ResultRow label="Harga modal (HPP)" value={hpp} />
                  <ResultRow label="Kemasan & packing" value={packing} />
                  <ResultRow label="Operasional" value={operational} />
                  <ResultRow label="Biaya lain-lain" value={otherCost} />
                  <ResultRow
                    label={`Administrasi (${effectiveAdminRate}%)`}
                    value={result.admin}
                    help={`${
                      currentProduct?.name || currentCategory.name
                    }; tarif tetap dapat disesuaikan mengikuti subkategori di Seller Centre.`}
                  />
                  <ResultRow
                    label={`Gratis Ongkir XTRA (${freeShippingRate}%)`}
                    value={result.freeShipping}
                    help={`Batas ${specialSize ? "Rp60.000" : "Rp40.000"} per kuantitas.`}
                  />
                  <ResultRow label="Promo XTRA+ (6,5%)" value={result.promo} />
                  <ResultRow
                    label={`Affiliate / AMS (${affiliateRate}%)`}
                    value={result.affiliateBase}
                  />
                  <ResultRow
                    label={`PPN komisi (${affiliateVatRate}%)`}
                    value={result.affiliateVat}
                  />
                  <ResultRow
                    label="Pembayaran Mall (1,8%)"
                    value={result.mallPayment}
                  />
                  <ResultRow label="Layanan pre-order (3%)" value={result.preorder} />
                  <ResultRow label="Premi / proteksi" value={result.premium} />
                  <ResultRow
                    label="Proses pesanan"
                    value={result.process}
                    help={`Rp1.250 dibagi ${Math.max(1, quantity)} item.`}
                  />
                  <ResultRow label="PPh Pasal 22 (0,5%)" value={result.pph} />
                  <ResultRow
                    label="Alokasi iklan"
                    value={result.ads}
                    help={`${rupiah.format(adActualSpend)} dibagi ${adOrders} pesanan dari iklan.`}
                  />
                  <ResultRow
                    label="Cadangan retur"
                    value={result.returnReserve}
                  />
                  <div className="result-separator" />
                  <ResultRow
                    label="Dana cair dari Shopee"
                    value={result.payout}
                    tone="income"
                  />
                  <ResultRow
                    label="Untung bersih"
                    value={result.profit}
                    tone="profit"
                  />
                </div>
              </article>
            </div>

            <div className="page-actions">
              <button
                className="secondary-button"
                onClick={() => navigate("input")}
                type="button"
              >
                Ubah input
              </button>
              <button className="primary-button" onClick={saveScenario} type="button">
                Simpan skenario
              </button>
            </div>
          </section>
        ) : null}

        {activePage === "scenario" ? (
          <section className="app-page">
            <div className="scenario-layout">
              <article className="panel save-card">
                <span className="save-icon">◇</span>
                <div>
                  <h2>Simpan simulasi saat ini</h2>
                  <p>
                    Data disimpan di perangkat ini agar Anda dapat membandingkan
                    beberapa produk atau strategi iklan.
                  </p>
                  <div className="save-preview">
                    <span>
                      {currentProduct?.name || currentCategory.name}
                      <small>Produk</small>
                    </span>
                    <span>
                      {rupiah.format(sellingPrice)}
                      <small>Harga aman</small>
                    </span>
                    <span>
                      {rupiah.format(result.profit)}
                      <small>Laba bersih</small>
                    </span>
                  </div>
                  <div className="save-actions">
                    <button onClick={saveScenario} type="button">
                      Simpan skenario baru
                    </button>
                    <button onClick={exportCsv} type="button">
                      Ekspor CSV
                    </button>
                  </div>
                </div>
              </article>

              <article className="panel saved-list-panel">
                <SectionHeading
                  title={`Tersimpan (${savedScenarios.length}/8)`}
                  description="Maksimal delapan skenario pada perangkat ini."
                  help="Penyimpanan menggunakan browser perangkat. Data tidak otomatis berpindah ke perangkat lain."
                />
                {savedScenarios.length ? (
                  <div className="saved-list">
                    {[...savedScenarios].reverse().map((scenario) => (
                      <div key={scenario.id}>
                        <span>
                          <strong>{scenario.name}</strong>
                          <small>
                            {new Intl.DateTimeFormat("id-ID", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            }).format(new Date(scenario.savedAt))}
                          </small>
                        </span>
                        <span>
                          <button
                            onClick={() => loadScenario(scenario.id)}
                            type="button"
                          >
                            Muat
                          </button>
                          <button
                            className="delete"
                            onClick={() => deleteScenario(scenario.id)}
                            type="button"
                          >
                            Hapus
                          </button>
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <span>◇</span>
                    <strong>Belum ada skenario</strong>
                    <small>Simpan hasil pertama untuk mulai membandingkan.</small>
                  </div>
                )}
              </article>
            </div>

            <article className="panel policy-panel">
              <SectionHeading
                title="Basis kebijakan & referensi"
                description="Nilai awal aplikasi berdasarkan informasi yang tersedia hingga 26 Juli 2026."
                help="Shopee dapat mengubah tarif dan menetapkan kategori secara berbeda. Selalu cocokkan dengan rincian pesanan dan Seller Centre."
              />
              <div className="policy-grid">
                <span>
                  <b>2,5%–10%</b>
                  Admin reguler
                </span>
                <span>
                  <b>1%–8%</b>
                  Layanan ukuran biasa
                </span>
                <span>
                  <b>2,5%–9,5%</b>
                  Layanan ukuran khusus
                </span>
                <span>
                  <b>Rp1.250</b>
                  Proses per transaksi
                </span>
              </div>
              <div className="source-links">
                <a
                  href="https://seller.shopee.co.id/edu/article/15965"
                  target="_blank"
                  rel="noreferrer"
                >
                  Rincian biaya per kategori
                </a>
                <a
                  href="https://seller.shopee.co.id/edu/article/7216"
                  target="_blank"
                  rel="noreferrer"
                >
                  Tarif layanan Gratis Ongkir
                </a>
                <a
                  href="https://help.shopee.co.id/portal/4/article/71187-Syarat-Layanan-Shopee"
                  target="_blank"
                  rel="noreferrer"
                >
                  Syarat layanan Shopee
                </a>
                <a
                  href="https://help.shopee.co.id/portal/4/article/71196-Syarat-dan-Ketentuan-Program-Gratis-Ongkir-XTRA"
                  target="_blank"
                  rel="noreferrer"
                >
                  Gratis Ongkir XTRA
                </a>
                <a
                  href="https://help.shopee.co.id/portal/4/article/196507-Syarat-dan-Ketentuan-Program-Promo-XTRA+"
                  target="_blank"
                  rel="noreferrer"
                >
                  Promo XTRA+
                </a>
                <a
                  href="https://seller.shopee.co.id/edu/article/27810"
                  target="_blank"
                  rel="noreferrer"
                >
                  PPh Pasal 22
                </a>
              </div>
              <p className="disclaimer">
                Kalkulator ini adalah alat simulasi independen, bukan layanan resmi
                Shopee. Tarif aktual mengikuti subkategori, status toko, program,
                pajak, dan rincian transaksi Anda.
              </p>
            </article>
          </section>
        ) : null}

        <nav className="mobile-nav" aria-label="Navigasi bawah">
          {MOBILE_NAV_ORDER.map((pageId) => {
            const item = NAV_ITEMS.find((navItem) => navItem.id === pageId);
            if (!item) return null;
            return (
              <button
                aria-current={activePage === item.id ? "page" : undefined}
                className={`${activePage === item.id ? "active" : ""} ${
                  item.id === "result" ? "primary-nav" : ""
                }`}
                key={item.id}
                onClick={() => navigate(item.id)}
                type="button"
              >
                <span>
                  <AppIcon name={item.icon} size={17} />
                </span>
                {item.shortLabel}
              </button>
            );
          })}
        </nav>
      </main>
    </div>
  );
}
