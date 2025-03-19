import { useState, useEffect } from "react";
import { Car, ClipboardList, Upload, Settings2 } from "lucide-react";
import { VehicleForm } from "./components/VehicleForm";
import { VehicleList } from "./components/VehicleList";
import { BulkVehicleForm } from "./components/BulkVehicleForm";
import { VehicleAttributesForm } from "./components/VehicleAttributesForm";
import { Tabs } from "./components/Tabs";
import { Vehicle } from "./components/types";
import { motion, AnimatePresence } from "framer-motion";

const tabs = [
  { 
    id: "list", 
    label: "Listado de Vehículos",
    icon: ClipboardList,
    description: "Ver y gestionar todos los vehículos registrados"
  },
  { 
    id: "register", 
    label: "Registrar Vehículo",
    icon: Car,
    description: "Añadir un nuevo vehículo al sistema"
  },
  { 
    id: "bulk", 
    label: "Registro Masivo",
    icon: Upload,
    description: "Importar múltiples vehículos desde un archivo"
  },
  { 
    id: "attributes", 
    label: "Gestión de Atributos",
    icon: Settings2,
    description: "Configurar familias, modelos y características"
  },
];

function VehiclePages() {
  const [activeTab, setActiveTab] = useState("list");
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setActiveTab("register");
  };

  const handleFormSuccess = () => {
    setEditingVehicle(null);
    setActiveTab("list");
  };

  return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      
        {/* Header */}
        <motion.div 
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
          className="flex items-center gap-4 mb-12">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-600/30">
            <Car className="w-8 h-8 text-white" />
          </motion.div>
          <div>
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold text-gray-800 tracking-tight">
              Sistema de Gestión de Vehículos
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-1 text-gray-600">
              Gestiona tu flota de vehículos de manera eficiente
            </motion.p>
          </div>
        </motion.div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {tabs.map((tab, index) => (
            <motion.button
              key={tab.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.5 }}
              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.1)" }}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === "list") setEditingVehicle(null);
              }}
              className={`p-4 rounded-xl border transition-all duration-300 text-left ${
                activeTab === tab.id
                  ? "bg-white shadow-lg border-indigo-200"
                  : "bg-gray-50 border-gray-200 hover:bg-white hover:border-indigo-100"
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <motion.div 
                  whileHover={{ rotate: 10 }}
                  className={`p-2 rounded-lg ${
                    activeTab === tab.id 
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600" 
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}>
                  <tab.icon className="w-5 h-5 text-white" />
                </motion.div>
                <h2 className="font-semibold text-gray-800">{tab.label}</h2>
              </div>
              <p className="text-sm text-gray-600">{tab.description}</p>
            </motion.button>
          ))}
        </div>

        {/* Main Content */}
        <motion.div 
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === "list" ? (
                <VehicleList onEdit={handleEdit} />
              ) : activeTab === "register" ? (
                <VehicleForm
                  initialData={editingVehicle}
                  onSuccess={handleFormSuccess}
                />
              ) : activeTab === "bulk" ? (
                <BulkVehicleForm onSuccess={() => setActiveTab("list")} />
              ) : (
                <VehicleAttributesForm onSuccess={() => setActiveTab("list")} />
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Footer */}
        <motion.footer 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-8 text-center text-sm text-gray-500">
          <p>Sistema de Gestión de Vehículos © {new Date().getFullYear()}</p>
        </motion.footer>
      </motion.div>

  );
}

export default VehiclePages;