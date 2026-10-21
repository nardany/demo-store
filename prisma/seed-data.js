// Ցուցադրական խանութի տվյալներ։ Ապրանքներն ու գները հորինված են, նկարները՝ Unsplash-ից։
const tree = [
  {
    name: "Զենքեր", slug: "zenqer", image: "/demo/rifle-sand.jpg",
    children: [
      { name: "Որսորդական հրացաններ", slug: "vorsordakan-hratsanner" },
      { name: "Ատրճանակներ", slug: "atrchanakner" },
    ],
  },
  {
    name: "Զինամթերք", slug: "zinamterq", image: "/demo/casings.jpg",
    children: [{ name: "Փամփուշտներ", slug: "pampushtner" }],
  },
  {
    name: "Օպտիկա", slug: "optika", image: "/demo/binoculars-rock.jpg",
    children: [{ name: "Հեռադիտակներ", slug: "heraditakner" }],
  },
  {
    name: "Դանակներ", slug: "danakner", image: "/demo/knife-log.jpg",
    children: [
      { name: "Որսորդական դանակներ", slug: "vorsordakan-danakner" },
      { name: "Ծալովի դանակներ", slug: "tsalovi-danakner" },
    ],
  },
  {
    name: "Ձկնորսություն", slug: "dzknorsutyun", image: "/demo/rod-reel.jpg",
    children: [
      { name: "Կոճեր", slug: "kocher" },
      { name: "Խայծեր", slug: "khaytser" },
    ],
  },
  {
    name: "Հագուստ և կոշիկ", slug: "hagust-koshik", image: "/demo/forest-hunters.jpg",
    children: [{ name: "Կոշիկներ", slug: "koshikner" }],
  },
  {
    name: "Պարագաներ", slug: "paraganer", image: "/demo/backpack.jpg",
    children: [{ name: "Արշավային պարագաներ", slug: "arshavayin" }],
  },
];

const products = [
  {
    title: "Որսորդական հրացան՝ օպտիկական նշանոցով",
    description: "Ճշգրիտ հրացան երկար տարածությունների համար՝ հենակով և օպտիկական նշանոցով։ Ձեռքբերման համար անհրաժեշտ է թույլտվություն։",
    price: 680000,
    images: ["/demo/rifle-sand.jpg", "/demo/rifle-road.jpg"],
    requiresLicense: true,
    isNew: true,
    specs: { "Կալիբր": ".308 Win", "Փողի երկարություն": "610 մմ", "Նշանոց": "3-12x50" },
    category: "vorsordakan-hratsanner",
  },
  {
    title: "Որսորդական կարաբին՝ փայտե կոթով",
    description: "Դասական կարաբին ընկուզենու կոթով՝ անտառային որսի համար։",
    price: 520000,
    oldPrice: 590000,
    images: ["/demo/rifle-tree.jpg", "/demo/hunter-field.jpg"],
    requiresLicense: true,
    specs: { "Կալիբր": "30-06", "Կոթ": "Ընկուզենի" },
    category: "vorsordakan-hratsanner",
  },
  {
    title: "Ատրճանակ 9 մմ",
    description: "Կոմպակտ ատրճանակ ինքնապաշտպանության և սպորտային հրաձգության համար։ Ձեռքբերումը՝ օրենքով սահմանված կարգով։",
    price: 310000,
    images: ["/demo/pistol.jpg"],
    requiresLicense: true,
    specs: { "Կալիբր": "9 մմ", "Պահունակ": "15 փամփուշտ" },
    category: "atrchanakner",
  },
  {
    title: "Ռևոլվեր .38 Special",
    description: "Հուսալի ռևոլվեր՝ ռետինապատ բռնակով։",
    price: 295000,
    images: ["/demo/revolver.jpg"],
    requiresLicense: true,
    specs: { "Կալիբր": ".38 Special", "Թմբուկ": "6 փամփուշտ" },
    category: "atrchanakner",
  },
  {
    title: "Փամփուշտներ .308 Win (20 հատ)",
    description: "Որսորդական փամփուշտներ խոշոր որսի համար։ Վաճառվում են միայն թույլտվություն ունեցողներին։",
    price: 18000,
    images: ["/demo/casings.jpg"],
    requiresLicense: true,
    specs: { "Կալիբր": ".308 Win", "Քանակ": "20 հատ" },
    category: "pampushtner",
  },
  {
    title: "Հեռադիտակ 10x42",
    description: "Ջրակայուն հեռադիտակ՝ պայծառ պատկերով, որսի և արշավների համար։",
    price: 46000,
    oldPrice: 55000,
    images: ["/demo/binoculars.jpg", "/demo/binoculars-rock.jpg"],
    isNew: true,
    specs: { "Խոշորացում": "10x", "Օբյեկտիվ": "42 մմ" },
    category: "heraditakner",
  },
  {
    title: "Կոմպակտ հեռադիտակ 8x25",
    description: "Թեթև և փոքր հեռադիտակ, որը տեղավորվում է գրպանում։",
    price: 19000,
    images: ["/demo/binoculars-hand.jpg"],
    specs: { "Խոշորացում": "8x", "Քաշը": "290 գ" },
    category: "heraditakner",
  },
  {
    title: "Որսորդական դանակ՝ ֆիքսված շեղբով",
    description: "Ամուր դանակ պատյանով՝ որսի և արշավների համար։",
    price: 24000,
    images: ["/demo/knife-log.jpg", "/demo/knife-table.jpg"],
    isNew: true,
    specs: { "Շեղբ": "Չժանգոտվող պողպատ", "Երկարություն": "120 մմ" },
    category: "vorsordakan-danakner",
  },
  {
    title: "Ծալովի դանակ՝ փայտե բռնակով",
    description: "Կոմպակտ ծալովի դանակ ամենօրյա օգտագործման համար։",
    price: 14500,
    oldPrice: 17000,
    images: ["/demo/knife-wood.jpg"],
    specs: { "Տեսակ": "Ծալովի", "Բռնակ": "Փայտ" },
    category: "tsalovi-danakner",
  },
  {
    title: "Պտտվող կոճ 3000",
    description: "Հարթ քաշքշուկով կոճ լճային և գետային ձկնորսության համար։",
    price: 21000,
    images: ["/demo/reel.jpg", "/demo/rod-reel.jpg"],
    specs: { "Չափ": "3000", "Առանցքակալներ": "6+1" },
    category: "kocher",
  },
  {
    title: "Ձկնորսական հավաքածու՝ կարթաձող և կոճ",
    description: "Պատրաստի հավաքածու սկսնակների համար։",
    price: 32000,
    images: ["/demo/rod.jpg"],
    specs: { "Երկարություն": "2.7 մ" },
    category: "kocher",
  },
  {
    title: "Խայծ «Wobbler» 15 սմ",
    description: "Վառ գույնի խայծ գիշատիչ ձկների համար։",
    price: 4500,
    images: ["/demo/lure.jpg", "/demo/lure-box.jpg"],
    isNew: true,
    specs: { "Երկարություն": "15 սմ" },
    category: "khaytser",
  },
  {
    title: "Արշավային կոշիկներ",
    description: "Ջրակայուն կոշիկներ լեռնային տեղանքի համար։",
    price: 42000,
    images: ["/demo/boots.jpg", "/demo/boots-rock.jpg"],
    specs: { "Չափսեր": "39 – 46" },
    category: "koshikner",
  },
  {
    title: "Որսորդական ուսապարկ 40 լ",
    description: "Ամուր ուսապարկ՝ բազմաթիվ գրպաններով։",
    price: 28000,
    oldPrice: 33000,
    images: ["/demo/backpack.jpg"],
    specs: { "Ծավալ": "40 լ" },
    category: "arshavayin",
  },
];

const promo = "Ցուցադրական կայք — բոլոր ապրանքներն ու գները օրինակի համար են";

module.exports = { tree, products, promo };
