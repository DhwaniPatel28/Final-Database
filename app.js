'use strict';

// ############################################# //
// ##### Server Setup for Patient Management API #####
// ############################################# //

// Importing packages
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
mongoose.set('strictQuery', false);

// Initialize Express app
const app = express();
// Define the port for the server to listen on
const port = process.env.PORT || 3000; // Default port set to 3000

// Middleware setup
// Enable CORS (Cross-Origin Resource Sharing) for all routes
app.use(cors());
// Enable Express to parse JSON formatted request bodies
app.use(express.json());
app.get("/", (req,res) => {
    res.send("Patient API is running");
});

// MongoDB connection string.
// This string is generated from the inputs provided in the UI.
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true, // Use the new URL parser instead of the deprecated one
    useUnifiedTopology: true // Use the new server discovery and monitoring engine
})
.then(() => {
    console.log('Connected to MongoDB');
    // Start the Express server only after successfully connecting to MongoDB
   /* app.listen(port, () => {
        console.log('Patient API Server is running on port ' + port);
    });*/
})
.catch((error) => {
    // Log any errors that occur during the MongoDB connection
    console.error('Error connecting to MongoDB:', error);
});


// ############################################# //
// ##### Patient Model Setup #####
// ############################################# //

// Define Mongoose Schema Class
const Schema = mongoose.Schema;

// Create a Schema object for the Patient model
// This schema defines the structure of patient documents in the MongoDB collection.
const patientSchema = new Schema({
    patientName: { type: String, required: true  },
    doctorAssigned: { type: String, required: true  },
    diagnosis: { type: String }
});

// Create a Mongoose model from the patientSchema.
// This model provides an interface to interact with the 'patients' collection in MongoDB.
// Mongoose automatically pluralizes "Patient" to "patients" for the collection name.
const Patient = mongoose.model("Patient", patientSchema);


// ############################################# //
// ##### Patient API Routes Setup #####
// ############################################# //

// Create an Express Router instance to handle patient-related routes.
const router = express.Router();

// Mount the router middleware at the '/api/patients' path.
// All routes defined on this router will be prefixed with '/api/patients'.
app.use('/api/v1/patient', router);

// Route to get all patients from the database.
// Handles GET requests to '/api/patients/'.
router.route("/")
    .get(async (req, res) => { // Added async
        try {
            const patients = await Patient.find(); // Added await
            res.json(patients);
        } catch (err) {
            res.status(400).json("Error: " + err);
        }
    });

// Route to get a specific patient by its ID.
// Handles GET requests to '/api/patients/:id'.
router.route("/:id")
    .get(async (req, res) => { // Added async
        try {
            const patient = await Patient.findById(req.params.id); // Added await
            res.json(patient);
        } catch (err) {
            res.status(400).json("Error: " + err);
        }
    });

// Route to add a new patient to the database.
// Handles POST requests to '/api/patients/add'.
router.route("/")
    .post(async (req, res) => { // Added async
        // Extract attributes from the request body.
        const patientName = req.body.patientName;
        const doctorAssigned = req.body.doctorAssigned;
        const diagnosis = req.body.diagnosis;

        // Create a new Patient object using the extracted data.
        const newPatient = new Patient({
            patientName,
            doctorAssigned,
            diagnosis
        });

        try {
            await newPatient.save(); // Added await
            res.json("Patient added!");
        } catch (err) {
            res.status(400).json("Error: " + err);
        }
    });

// Route to update an existing patient by its ID.
// Handles PUT requests to '/api/patients/update/:id'.
router.route("/update/:id")
    .put(async (req, res) => { // Added async
        try {
            const patient = await Patient.findById(req.params.id); // Added await
            if (!patient) {
                return res.status(404).json("Error: Patient not found");
            }

            // Update the patient's attributes with data from the request body.
            patient.patientName = req.body.patientName;
                patient.doctorAssigned = req.body.doctorAssigned;
                patient.diagnosis = req.body.diagnosis;

            await patient.save(); // Added await
            res.json("Patient updated!");
        } catch (err) {
            res.status(400).json("Error: " + err);
        }
    });

// Route to delete a patient by its ID.
// Handles DELETE requests to '/api/patients/delete/:id'.
router.route("/delete/:id")
    .delete(async (req, res) => { // Added async
        try {
            const deletedPatient = await Patient.findByIdAndDelete(req.params.id); // Added await
            if (!deletedPatient) {
                return res.status(404).json("Error: Patient not found");
            }
            res.json("Patient deleted.");
        } catch (err) {
            res.status(400).json("Error: " + err);
        }
    });