import type { Brand } from "./types";

export const demo: Brand = {
  id: "demo",
  name: "Դեմո խանութ",
  nameLatin: "DEMO STORE",
  tagline: "Որսորդական և ձկնորսական պարագաների խանութ",
  description:
    "DEMO STORE — ցուցադրական կայք. որսորդական զենքեր, օպտիկա, դանակներ, ձկնորսական պարագաներ և հագուստ՝ կատալոգով, որոնումով և կառավարման պանելով։",

  phone: "+374 00 000000",
  phoneRaw: "+37400000000",
  whatsapp: "37400000000",

  address: {
    venue: "Կենտրոն",
    pavilion: "Խանութ-սրահ",
    street: "Օրինակ փողոց 1",
    city: "Երևան",
  },
  mapEmbed: "https://maps.google.com/maps?q=Republic%20Square%2C%20Yerevan&z=15&output=embed",
  mapLink: "https://maps.google.com/?q=Republic+Square+Yerevan",
  hours: { open: "10:00", close: "20:00", closedDays: [] },

  social: {},

  logo: null,
  icons: { icon: "/demo/icon.png", apple: "/demo/apple-icon.png" },
  images: {
    hero: "/demo/hero.jpg",
    og: "/demo/forest-hunters.jpg",
    fallback: "/demo/backpack.jpg",
    notFound: "/demo/binoculars-rock.jpg",
    store: [
      { src: "/demo/forest-hunters.jpg", alt: "Որսորդներ անտառում" },
      { src: "/demo/knife-log.jpg", alt: "Որսորդական դանակ" },
      { src: "/demo/reel.jpg", alt: "Ձկնորսական կոճ" },
      { src: "/demo/binoculars.jpg", alt: "Հեռադիտակ" },
      { src: "/demo/boots.jpg", alt: "Կոշիկներ" },
      { src: "/demo/lure.jpg", alt: "Խայծ" },
    ],
  },

  place: { in: "խանութում", to: "խանութ" },
  hero: {
    title: "Որսի և ձկնորսության համար՝ մեկ վայրում",
    text: "Զենքեր, օպտիկա, դանակներ, ձկնորսական պարագաներ և հագուստ։ Ընտրեք կայքում, գրեք մեզ կամ այցելեք խանութ։",
  },
  quickSearches: ["Հեռադիտակ", "Դանակ", "Կոճ", "Կոշիկ", "Խայծ"],

  benefits: [
    { icon: "advice", title: "Մասնագետի խորհուրդ", text: "Կօգնենք ընտրել ճիշտ զենքը, օպտիկան կամ պարագան ձեր նպատակի համար" },
    { icon: "original", title: "Միայն օրիգինալ ապրանքներ", text: "Աշխատում ենք վստահելի մատակարարների հետ" },
    { icon: "chat", title: "Արագ կապ", text: "Գրեք WhatsApp կամ Viber, պատասխանում ենք նույն օրը" },
    { icon: "order", title: "Պատվերով բերում", text: "Չգտա՞ք ապրանքը, կբերենք պատվերով" },
  ],
  steps: [
    { title: "Ընտրեք կայքում", text: "Գտեք ապրանքը կատալոգում կամ որոնման միջոցով" },
    { title: "Գրեք մեզ", text: "Մեկ սեղմումով WhatsApp, Viber կամ զանգ՝ ապրանքի անունով" },
    { title: "Վերցրեք խանութից", text: "Եկեք, տեսեք տեղում և վերցրեք ձեր ընտրածը" },
  ],
  testimonials: [
    { name: "Արմեն Ս.", rating: 5, text: "Կայքում տեսա հեռադիտակը, գրեցի WhatsApp-ով, հաջորդ օրը արդեն վերցրի։ Շատ հարմար է։" },
    { name: "Դավիթ Մ.", rating: 5, text: "Լավ խորհուրդ տվեցին կոճի ընտրության հարցում, գինն էլ ավելի մատչելի էր, քան սպասում էի։" },
    { name: "Գոռ Հ.", rating: 4, text: "Մեծ տեսականի և արագ պատասխան։ Զեղչերի բաժինը հատկապես օգտակար է։" },
  ],
};
