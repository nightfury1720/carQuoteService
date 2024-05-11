import express from "express";
import { initializeApp } from "firebase/app";
import cors from "cors";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
} from "firebase/firestore/lite";
import { quoteCalculator } from "./helper.js";
import { Client } from "@googlemaps/google-maps-services-js";
const firebaseConfig = {
  apiKey: "AIzaSyBt_IRgNnPVgggfy8tb89xVSlhJ-jJN2VQ",
  authDomain: "carservice-637df.firebaseapp.com",
  projectId: "carservice-637df",
  storageBucket: "carservice-637df.appspot.com",
  messagingSenderId: "722836941976",
  appId: "1:722836941976:web:bdc19fa2f7813d6ff5f4ed",
  measurementId: "G-60Z8FSBMFE",
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

const client = new Client({});

// Get a list of cities from your database
async function getCars() {
  const citiesCol = collection(db, "cars");
  const citySnapshot = await getDocs(citiesCol);
  const cityList = citySnapshot.docs.map((doc) => doc.data());
  return cityList;
}

async function getCarById(carId) {
  try {
    const carsCol = collection(db, "cars");
    const q = query(carsCol, where("carId", "==", carId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log("No matching documents.");
      return null;
    } else {
      // Assuming there's only one document matching the carId
      const carDoc = querySnapshot.docs[0];
      return carDoc.data();
    }
  } catch (error) {
    console.error("Error getting car by ID:", error);
    throw error;
  }
}

const app = express();

app.use(express.json());
app.use(cors());

// Get all cars
app.get("/cars", async (req, res) => {
  try {
    const cars = await getCars();
    res.json(cars);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get car by ID
app.get("/cars/:carId", async (req, res) => {
  try {
    const { carId } = req.params;
    const car = await getCarById(carId);
    console.log(car, carId);
    if (car) {
      res.json(car);
    } else {
      res.status(404).json({ error: "Car not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get quotation for renting a car
app.get("/quote/:carId", async (req, res) => {
  try {
    const { carId } = req.params;
    const car = await getCarById(carId);
    if (car) {
      const rentTime = Number(req.query.rentTime);
      const carHourlyRate = car.hourlyRate;
      const availabilityStatus = car.availability;
      const quote = quoteCalculator(
        rentTime,
        carHourlyRate,
        availabilityStatus
      );
      console.log(quote);
      if (quote !== -1) {
        res.json({ quote });
      } else {
        res.status(400).json({ error: "Car not available" });
      }
    } else {
      res.status(404).json({ error: "Car not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/calculate-distance", async (req, res) => {
  const { originLat, originLng, destinationLat, destinationLng } = req.body;
  const apiKey = "AIzaSyBoe_uPAfpB82mJ3EsqqeWCCL9v6UiS5Z4";

  try {
    const response = await client.directions({
      params: {
        origin: `${originLat},${originLng}`,
        destination: `${destinationLat},${destinationLng}`,
        key: apiKey,
      },
    });

    console.log(response.data.routes[0].legs);
    if (response.data.status === "OK") {
      const route = response.data.routes[0];
      let totalDistance = 0;
      let totalTime =0;
      for (const leg of route.legs) {
        totalDistance += leg.distance.value;
        totalTime += leg.duration.value;
      }
      totalDistance = totalDistance / 1000; // Convert meters to kilometers
      res.json({ distance: totalDistance , time: totalTime});
    } else {
      console.error("Error calculating distance:", response.data.status);
      res.status(500).json({ error: "Internal server error" });
    }
  } catch (error) {
    console.error("Error calculating distance:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
