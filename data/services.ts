export type Service = {
  slug: string;
  name: string;
  price: number | null;
  image: string;
  description: string;
  longDescription?: string;
  gallery?: string[];
};

export type ServiceCategory = {
  slug: string;
  title: string;
  services: Service[];
  
};

export const categories: ServiceCategory[] = [
  {
    slug: "cilios",
    title: "Alongamento de Cílios",
    services: [
      {
        slug: "fio-classico",
        name: "Fio Clássico",
        price: 150,
        image:"/services/fio-classico/1.jpeg",
        description: "Aplicação fio a fio para um olhar marcante e natural.",
        gallery: [
          "/services/fio-classico/2.jpeg",
          "/services/fio-classico/3.jpeg",
          "/services/fio-classico/4.jpeg",
          "/services/fio-classico/5.jpeg",
          "/services/fio-classico/6.jpeg",
          "/services/fio-classico/7.jpeg",
          "/services/fio-classico/8.jpeg",
        ],
      },
      {
        slug: "classico-natural",
        name: "Clássico Natural",
        price: 150,
        image: "/services/classico-natural/1.jpeg",
        description: "Efeito sutil e elegante para o dia a dia.",
        gallery: [
          "/services/classico-natural/2.jpeg",
          "/services/classico-natural/3.jpeg",
          "/services/classico-natural/4.jpeg",
        ],
      },
      {
        slug: "volume-charm",
        name: "Volume Charm",
        price: 150,
        image: "/services/volume-charm/1.jpeg",
        description: "Volume médio com toque de sofisticação.",
        gallery: [
          "/services/volume-charm/2.jpeg",
        ],
      },
      {
        slug: "volume-glamour",
        name: "Volume Glamour",
        price: 150,
        image: "/services/volume-glamour/1.jpeg",
        description: "Volume intenso para um olhar impactante.",
        gallery: [
          "/services/volume-glamour/2.jpeg",
          "/services/volume-glamour/3.jpeg",
          "/services/volume-glamour/4.jpeg",
          "/services/volume-glamour/5.jpeg",
          "/services/volume-glamour/6.jpeg",
        ],
      },
      {
        slug: "volume-radiance",
        name: "Volume Radiance",
        price: 150,
        image: "/services/volume-radiance/1.jpeg",
        description: "Cílios volumosos e leves que iluminam o olhar.",
        gallery: [
          "/services/volume-radiance/2.jpeg",
          "/services/volume-radiance/3.jpeg",
          "/services/volume-radiance/4.jpeg",
          "/services/volume-radiance/5.jpeg",
          "/services/volume-radiance/6.jpeg",
          "/services/volume-radiance/7.jpeg",
          "/services/volume-radiance/8.jpeg",
          "/services/volume-radiance/9.jpeg",
        ],
      },
      {
        slug: "volume-marrom",
        name: "Volume Marrom",
        price: 150,
        image: "/services/volume-marrom/1.jpeg",
        description: "Cílios marrons que harmonizam com o tom natural.",
        gallery: [
          "/services/volume-marrom/2.jpeg",
          "/services/volume-marrom/3.jpeg",
          "/services/volume-marrom/4.jpeg",
          "/services/volume-marrom/5.jpeg",
          "/services/volume-marrom/6.jpeg",
          "/services/volume-marrom/7.jpeg",
          "/services/volume-marrom/8.jpeg",
          "/services/volume-marrom/9.jpeg",
          "/services/volume-marrom/10.jpeg",
          "/services/volume-marrom/11.jpeg",
        ],
      },
      {
        slug: "volume-secrets",
        name: "Volume Secrets",
        price: 150,
        image: "/services/volume-secrets/1.jpeg",
        description: "Técnica exclusiva para um volume único e duradouro.",
        gallery: [
          "/services/volume-secrets/2.jpeg",
          "/services/volume-secrets/3.jpeg",
          "/services/volume-secrets/4.jpeg",
          "/services/volume-secrets/5.jpeg",
          "/services/volume-secrets/6.jpeg",
        ],
      },
      {
        slug: "brown-lumination",
        name: "Brown Lumination",
        price: 150,
        image: "/services/brown-lumination/1.jpeg",
        description: "Combinação de fios marrons elegantes para um olhar refinado.",
        gallery: [
          "/services/brown-lumination/2.jpeg",
          "/services/brown-lumination/3.jpeg",
          "/services/brown-lumination/4.jpeg",
          "/services/brown-lumination/5.jpeg",
          "/services/brown-lumination/6.jpeg",
          "/services/brown-lumination/7.jpeg",
          "/services/brown-lumination/8.jpeg",
        ],
      },
    ],
  },
  {
    slug: "sobrancelhas",
    title: "Sobrancelhas",
    services: [
      {
        slug: "design-de-sobrancelhas",
        name: "Design de Sobrancelhas",
        price: 150,
        image: "/services/design-de-sobrancelhas/1.jpeg",
        description: "Design personalizado que harmoniza com seus traços.",
      },
    ],
  },
{
  slug: "estrias",
  title: "Tratamento de Estrias",
  services: [
    {
      slug: "tratamento-estrias",
      name: "Tratamento de Estrias",
      price: null,
      image: "/services/estrias/1.jpeg",
      description: "Tratamento personalizado para redução e prevenção de estrias.",
      gallery: [],
    },
  ],
},
  {
    slug: "cilios-naturais",
    title: "Cílios Naturais",
    services: [
      {
        slug: "lash-lifting",
        name: "Lash Lifting",
        price: null,
        image: "/services/lash-lifting/1.jpeg",
        description: "Curvatura natural e duradoura para seus próprios cílios.",
        gallery: [
          "/services/lash-lifting/2.jpeg",
          "/services/lash-lifting/3.jpeg",
          "/services/lash-lifting/4.jpeg",
          "/services/lash-lifting/5.jpeg",
          "/services/lash-lifting/6.jpeg",
          "/services/lash-lifting/7.jpeg",
          "/services/lash-lifting/8.jpeg",
        ],
      },
    ],
  },
];


export const contactInfo = {
  phone: "5562999999999",
  instagram: "deboraalencarbeauty",
  address: "Rua João Pessoa, Quadra 51A Lote 13",
  city: "Goiânia — GO",  
};
export function getServiceBySlug(slug: string): Service | null {
  for (const category of categories) {
    const service = category.services.find((s) => s.slug === slug);
    if (service) return service;
  }
  return null;
}
