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
];
