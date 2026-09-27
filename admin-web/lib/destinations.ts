export interface Destination {
  id: number;
  name: string;
  country: string;
  properties: number;
  image: string;
}

export const destinations: Destination[] = [
  {
    id: 1,
    name: "Đà Lạt",
    country: "Việt Nam",
    properties: 25,
    image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 2,
    name: "Sa Pa",
    country: "Việt Nam",
    properties: 18,
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 3,
    name: "Phú Quốc",
    country: "Việt Nam",
    properties: 32,
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 4,
    name: "Hội An",
    country: "Việt Nam",
    properties: 21,
    image: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 5,
    name: "Nha Trang",
    country: "Việt Nam",
    properties: 28,
    image: "https://images.unsplash.com/photo-1509233725247-49e657c54213?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 6,
    name: "Ninh Bình",
    country: "Việt Nam",
    properties: 15,
    image: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=600&q=80",
  },
];
