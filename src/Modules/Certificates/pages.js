export const CERTIFICATES_BASE = "/certificates";

export const CERTIFICATE_PAGES = [
  {
    key: "bonafideCertificate",
    slug: "bonafide-certificate",
    title: "Bonafide Certificate",
    icon: "Certificate",
    group: "Certificates",
    roles: ["acadadmin"],
    desktopOnly: true,
  },
  {
    key: "feeCertificate",
    slug: "fee-certificate",
    title: "Paid / Unpaid Certificate",
    icon: "Receipt",
    group: "Certificates",
    roles: ["acadadmin"],
    desktopOnly: true,
  },
  {
    key: "demandLetter",
    slug: "demand-letter",
    title: "Demand Letter",
    icon: "ReceiptX",
    group: "Certificates",
    roles: ["acadadmin"],
    desktopOnly: true,
  },
  {
    key: "feeStructureCertificate",
    slug: "fee-structure-certificate",
    title: "Fee Structure Certificate",
    icon: "Table",
    group: "Certificates",
    roles: ["acadadmin"],
    desktopOnly: true,
  },
];
