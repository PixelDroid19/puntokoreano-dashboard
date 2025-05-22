import { AnimatePresence, motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import BrandForm from "./brand-form";
import FamilyForm from "./family-form";
import ModelForm from "./model-form";
import TransmissionForm from "./transmission-form";
import FuelForm from "./fuel-form";
import VehicleMainForm from "./VehicleMainForm";
import {
  Car,
  Tag,
  Folder,
  Layers,
  GitBranch,
  Cog,
  Droplet,
} from "lucide-react";

export default function VehicleForm() {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white rounded-lg shadow"
    >
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Gestión de Vehículos</h2>

        <Tabs className="w-full" defaultValue="marca">
          <TabsList className="grid grid-cols-6 mb-6 border-b">
            <TabsTrigger 
              value="marca" 
              className="border-r py-2 px-4 text-center transition-all duration-200 hover:bg-gray-100 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-600 data-[state=active]:border-b-2 data-[state=active]:border-b-purple-600"
            >
              Marca
            </TabsTrigger>
            <TabsTrigger 
              value="familia" 
              className="border-r py-2 px-4 text-center transition-all duration-200 hover:bg-gray-100 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-600 data-[state=active]:border-b-2 data-[state=active]:border-b-purple-600"
            >
              Familia
            </TabsTrigger>
            <TabsTrigger 
              value="modelo" 
              className="border-r py-2 px-4 text-center transition-all duration-200 hover:bg-gray-100 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-600 data-[state=active]:border-b-2 data-[state=active]:border-b-purple-600"
            >
              Modelo
            </TabsTrigger>
            <TabsTrigger 
              value="transmision" 
              className="border-r py-2 px-4 text-center transition-all duration-200 hover:bg-gray-100 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-600 data-[state=active]:border-b-2 data-[state=active]:border-b-purple-600"
            >
              Caja de velocidades
            </TabsTrigger>
              <TabsTrigger
              value="combustible" 
              className="border-r py-2 px-4 text-center transition-all duration-200 hover:bg-gray-100 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-600 data-[state=active]:border-b-2 data-[state=active]:border-b-purple-600"
            >
              Combustible
            </TabsTrigger>
            <TabsTrigger 
              value="vehiculo" 
              className="py-2 px-4 text-center transition-all duration-200 hover:bg-gray-100 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-600 data-[state=active]:border-b-2 data-[state=active]:border-b-purple-600"
            >
              Vehículo
              </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <>
              <TabsContent value="vehiculo">
                <VehicleMainForm />
              </TabsContent>
              <TabsContent value="marca">
                <BrandForm />
              </TabsContent>
              <TabsContent value="familia">
                <FamilyForm />
              </TabsContent>
              <TabsContent value="modelo">
                <ModelForm />
              </TabsContent>
              <TabsContent value="transmision">
                <TransmissionForm />
              </TabsContent>
              <TabsContent value="combustible">
                <FuelForm />
              </TabsContent>
            </>
          </AnimatePresence>
        </Tabs>
      </div>
    </motion.div>
  );
}
