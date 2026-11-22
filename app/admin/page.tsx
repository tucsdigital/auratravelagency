'use client';

import ProtectedRoute from '@/components/admin/ProtectedRoute';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, FolderKanban, MessageSquare, Mail } from 'lucide-react';
import { useEffect, useState } from 'react';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    categorias: 0,
    paquetes: 0,
    consultas: 0,
    newsletter: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [categoriasSnap, paquetesSnap, consultasSnap, newsletterSnap] = await Promise.all([
          getDocs(collection(db, 'categorias')),
          getDocs(collection(db, 'paquetes')),
          getDocs(query(collection(db, 'consultas'), where('leida', '==', false))),
          getDocs(collection(db, 'newsletter')),
        ]);

        setStats({
          categorias: categoriasSnap.size,
          paquetes: paquetesSnap.size,
          consultas: consultasSnap.size,
          newsletter: newsletterSnap.size,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Dashboard</h1>
            <p className="text-gray-600 mt-1">Bienvenido al panel de administración de AURA TRAVEL AGENCY</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Categorías
                </CardTitle>
                <FolderKanban className="h-5 w-5 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.categorias}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Paquetes
                </CardTitle>
                <Package className="h-5 w-5 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.paquetes}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Consultas sin leer
                </CardTitle>
                <MessageSquare className="h-5 w-5 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{stats.consultas}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Newsletter
                </CardTitle>
                <Mail className="h-5 w-5 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{stats.newsletter}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Inicio Rápido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Desde este panel podés gestionar todo el contenido de tu sitio web:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Crear y editar categorías de viajes</li>
                <li>Agregar y gestionar paquetes turísticos</li>
                <li>Ver y responder consultas de clientes</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}

