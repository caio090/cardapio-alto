// TODO: substituir pelos dados reais da Cárdapio Alto antes de publicar.
export const contact = {
  whatsapp: "5500000000000", // formato internacional, só dígitos
  whatsappLabel: "(00) 00000-0000",
  email: "contato@cardapioalto.com.br",
  instagram: "@cardapioalto",
};

export const whatsappHref = (message: string) =>
  `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(message)}`;
