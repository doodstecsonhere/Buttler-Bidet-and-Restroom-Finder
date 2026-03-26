import { Router, type IRouter } from "express";
import { GetBidetsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

const BIDET_LOCATIONS = [
  { id: 1, name: "85° Artisan Cafe", latitude: 9.3174404, longitude: 123.3033471 },
  { id: 2, name: "Bigby's", latitude: 9.3222821, longitude: 123.3121083 },
  { id: 3, name: "Brain Brew", latitude: 9.3164464, longitude: 123.3073764 },
  { id: 4, name: "But First Coffee", latitude: 9.3068205, longitude: 123.3086295 },
  { id: 5, name: "Cafe Mamia", latitude: 9.3081583, longitude: 123.3089386 },
  { id: 6, name: "Casablanca Restaurant", latitude: 9.30835, longitude: 123.31175 },
  { id: 7, name: "Cha Tuk Chak", latitude: 9.3041365, longitude: 123.3086081 },
  { id: 8, name: "CityMall Dumaguete", latitude: 9.3292, longitude: 123.3005 },
  { id: 9, name: "Crete Cafe", latitude: 9.3256384, longitude: 123.304766 },
  { id: 10, name: "DGTech Computer", latitude: 9.3087894, longitude: 123.3076631 },
  { id: 11, name: "Freedom Park", latitude: 9.3131063, longitude: 123.3024986 },
  { id: 12, name: "Gabby's Bistro (Bantayan/Main)", latitude: 9.32718, longitude: 123.30432 },
  { id: 13, name: "Gabby's Bistro (Boulevard)", latitude: 9.30778, longitude: 123.30972 },
  { id: 14, name: "Greenwich (Downtown/Perdices)", latitude: 9.30805, longitude: 123.30778 },
  { id: 15, name: "Greenwich (Robinsons Place)", latitude: 9.29821, longitude: 123.30312 },
  { id: 16, name: "Jo's Chicken Inato (Main)", latitude: 9.310204, longitude: 123.3079538 },
  { id: 17, name: "Jollibee near Negros Oriental Provincial Hospital", latitude: 9.3213349, longitude: 123.2996134 },
  { id: 18, name: "Jollibee near NORSU", latitude: 9.311575, longitude: 123.3048605 },
  { id: 19, name: "Jollibee near Quezon Park", latitude: 9.30602, longitude: 123.3076 },
  { id: 20, name: "Jollibee near Robinsons Place Mall", latitude: 9.29792, longitude: 123.30384 },
  { id: 21, name: "La Essencia Cafe (Hotel Essencia)", latitude: 9.3089525, longitude: 123.3056451 },
  { id: 22, name: "La Mensa Bar", latitude: 9.3202871, longitude: 123.3102619 },
  { id: 23, name: "Lighthouse Point Hotel Lobby", latitude: 9.3262058, longitude: 123.306809 },
  { id: 24, name: "llaollao Boulevard", latitude: 9.3092609, longitude: 123.3092622 },
  { id: 25, name: "Lorenzo's Steak en Deli (Don Atilano)", latitude: 9.3216287, longitude: 123.3072754 },
  { id: 26, name: "Mala King", latitude: 9.3086886, longitude: 123.3080506 },
  { id: 27, name: "McDonald's (Business Park/Calindagan)", latitude: 9.29854, longitude: 123.30412 },
  { id: 28, name: "McDonald's (Downtown Perdices)", latitude: 9.30794, longitude: 123.30801 },
  { id: 29, name: "McDonald's (North Road/Daro)", latitude: 9.32215, longitude: 123.29985 },
  { id: 30, name: "Moriah Pension", latitude: 9.3189217, longitude: 123.3013061 },
  { id: 31, name: "Pulantubig Barangay Hall", latitude: 9.3243267, longitude: 123.2881269 },
  { id: 32, name: "Robinsons Place Mall Calindagan", latitude: 9.2981397, longitude: 123.3031973 },
  { id: 33, name: "Rollin' Pin", latitude: 9.3118974, longitude: 123.3079089 },
  { id: 34, name: "Sans Rival (Filinvest Mall)", latitude: 9.3226818, longitude: 123.312058 },
  { id: 35, name: "Sans Rival (Robinsons Place)", latitude: 9.29825, longitude: 123.30305 },
  { id: 36, name: "Sans Rival Bistro (Boulevard)", latitude: 9.30813, longitude: 123.3118 },
  { id: 37, name: "Sans Rival Cakes & Pastries (San Jose)", latitude: 9.30815, longitude: 123.31145 },
  { id: 38, name: "Silliman University Cafeteria", latitude: 9.3114241, longitude: 123.3076293 },
  { id: 39, name: "Silliman University College of Arts and Sciences", latitude: 9.3120477, longitude: 123.3067404 },
  { id: 40, name: "Silliman University College of Business Administration (PWD Stalls)", latitude: 9.312909, longitude: 123.3071 },
  { id: 41, name: "Silliman University Library", latitude: 9.3136022, longitude: 123.3063143 },
  { id: 42, name: "Silliman University Luce Auditorium", latitude: 9.313288, longitude: 123.3056 },
  { id: 43, name: "Silliman University Medical Center", latitude: 9.3164356, longitude: 123.3042132 },
  { id: 44, name: "Silliman University Senior High School Building", latitude: 9.314275, longitude: 123.305325 },
  { id: 45, name: "The Apartment 5", latitude: 9.3185567, longitude: 123.3069842 },
  { id: 46, name: "The Coffee Bean & Tea Leaf", latitude: 9.3199144, longitude: 123.3124192 },
  { id: 47, name: "The Henry Resort", latitude: 9.3273516, longitude: 123.3102551 },
  { id: 48, name: "Tres Bistro", latitude: 9.3178512, longitude: 123.3071118 },
  { id: 49, name: "Wrkpod (HQ/Downtown)", latitude: 9.30811, longitude: 123.3077 },
  { id: 50, name: "Wrkpod (Northside)", latitude: 9.3285556, longitude: 123.2960328 },
  { id: 51, name: "Yvan Cafe", latitude: 9.3193068, longitude: 123.3068378 },
];

router.get("/bidets", (_req, res) => {
  const data = GetBidetsResponse.parse(BIDET_LOCATIONS);
  res.json(data);
});

export default router;
