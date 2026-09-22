export interface Destination {
  id: number;
  name: string;
  country: string;
  properties: number;
  image: string;
}

const IMG_DA_NANG =
  "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=900&q=80";
const IMG_HA_NOI =
  "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=900&q=80";
const IMG_HO_CHI_MINH_CITY =
  "https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=900&q=80";
const IMG_DA_LAT =
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80";

export const destinations: Destination[] = [
  {
    id: 1,
    name: "Da Nang",
    country: "Vietnam",
    properties: 2,
    image: IMG_DA_NANG,
  },
  {
    id: 2,
    name: "Ha Noi",
    country: "Vietnam",
    properties: 1,
    image: IMG_HA_NOI,
  },
  {
    id: 3,
    name: "Ho Chi Minh City",
    country: "Vietnam",
    properties: 1,
    image: IMG_HO_CHI_MINH_CITY,
  },
  {
    id: 4,
    name: "Da Lat",
    country: "Vietnam",
    properties: 1,
    image: IMG_DA_LAT,
  },
];
