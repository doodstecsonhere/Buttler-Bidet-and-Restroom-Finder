import { Router, type IRouter } from "express";
import { GetBidetsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

const BIDET_LOCATIONS = [
  { id: 1, name: "Bigby's", latitude: 9.3222821, longitude: 123.3121083 },
  { id: 2, name: "Jollibee near Provincial Hospital", latitude: 9.3213349, longitude: 123.2996134 },
  { id: 3, name: "Jo's Chicken Inato (Main)", latitude: 9.310204, longitude: 123.3079538 },
  { id: 4, name: "Silliman University Library", latitude: 9.3136022, longitude: 123.3063143 },
  { id: 5, name: "Pulantubig Barangay Hall", latitude: 9.3243267, longitude: 123.2881269 },
  { id: 6, name: "DGTech Computer", latitude: 9.3087894, longitude: 123.3076631 },
  { id: 7, name: "Cha Tuk Chak", latitude: 9.3041365, longitude: 123.3086081 },
  { id: 8, name: "llaollao Boulevard", latitude: 9.3092609, longitude: 123.3092622 },
  { id: 9, name: "Sans Rival (Filinvest Mall)", latitude: 9.3226818, longitude: 123.312058 },
  { id: 10, name: "La Essencia Cafe (Hotel Essencia)", latitude: 9.3089525, longitude: 123.3056451 },
  { id: 11, name: "Moriah Pension", latitude: 9.3189217, longitude: 123.3013061 },
  { id: 12, name: "Cafe Mamia", latitude: 9.3081583, longitude: 123.3089386 },
  { id: 13, name: "Freedom Park", latitude: 9.3131063, longitude: 123.3024986 },
  { id: 14, name: "Woodward Little Theater Silliman University", latitude: 9.3132883, longitude: 123.3056001 },
  { id: 15, name: "Rollin' Pin", latitude: 9.3118974, longitude: 123.3079094 },
  { id: 16, name: "Gabby's Bistro Bantayan (Employee CR)", latitude: 9.3272255, longitude: 123.3042454 },
  { id: 17, name: "Lighthouse Point Hotel Lobby", latitude: 9.3262062, longitude: 123.3068087 },
  { id: 18, name: "The Coffee Bean & Tea Leaf", latitude: 9.3199139, longitude: 123.3124187 },
  { id: 19, name: "SU Cafeteria", latitude: 9.311424, longitude: 123.3076288 },
  { id: 20, name: "Tres Bistro", latitude: 9.3178506, longitude: 123.3071123 },
  { id: 21, name: "But First Coffee", latitude: 9.3068206, longitude: 123.3086298 },
  { id: 22, name: "85° Artisan Cafe", latitude: 9.3174402, longitude: 123.3033472 },
  { id: 23, name: "The Henry Resort", latitude: 9.3273519, longitude: 123.3102554 },
  { id: 24, name: "La Mensa Bar", latitude: 9.320287, longitude: 123.3102617 },
  { id: 25, name: "The Apartment 5", latitude: 9.3185571, longitude: 123.3069839 },
  { id: 26, name: "Lorenzo's Steak en Deli (Don Atilano)", latitude: 9.3216287, longitude: 123.3072753 },
];

router.get("/bidets", (_req, res) => {
  const data = GetBidetsResponse.parse(BIDET_LOCATIONS);
  res.json(data);
});

export default router;
