import express from 'express';
import { fetchMosque } from '../controllers/auth-controller.js';
const route = express.Router();
route.get('/fetchmosque', fetchMosque)
export  default route