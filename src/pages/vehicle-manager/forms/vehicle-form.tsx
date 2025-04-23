import { AnimatePresence, motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import BrandForm from "./brand-form";
import FamilyForm from "./family-form";
import ModelForm from "./model-form";
import LineForm from "./line-form";
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

        <Tabs className="w-full" defaultValue="vehiculo">
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 mb-6">
            {" "}
            {/* Adjusted grid for responsiveness */}
            {[
              { id: "vehiculo", icon: Car, label: "Vehículo" },
              { id: "marca", icon: Tag, label: "Marca" },
              { id: "familia", icon: Folder, label: "Familia" },
              { id: "modelo", icon: Layers, label: "Modelo" },
              { id: "linea", icon: GitBranch, label: "Línea" },
              { id: "transmision", icon: Cog, label: "Transmisión" },
              { id: "combustible", icon: Droplet, label: "Combustible" },
            ].map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex items-center justify-center sm:justify-start gap-2 transition-all duration-200 hover:bg-gray-100 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-600" // Added active styles
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <tab.icon className="w-4 h-4" />
                </motion.div>
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <AnimatePresence mode="wait">
            <>
              <TabsContent value="vehiculo">
                <VehicleMainForm />
              </TabsContent>
              {/* Other Tab Contents remain the same */}
              <TabsContent value="marca">
                <BrandForm />
              </TabsContent>
              <TabsContent value="familia">
                <FamilyForm />
              </TabsContent>
              <TabsContent value="modelo">
                <ModelForm />
              </TabsContent>
              <TabsContent value="linea">
                <LineForm />
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
