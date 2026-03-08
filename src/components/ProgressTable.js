import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrash2, FiCheckCircle, FiClock, FiActivity } from 'react-icons/fi';

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/animated-table-rows';

const initialWorkoutData = [
  {
    id: 'WORK001',
    exercise: 'Trazioni Assistite',
    day: 'Giorno 1',
    sets: '5 x 5-6',
    weight: '30kg',
    reps: '5',
    completed: true,
  },
  {
    id: 'WORK002',
    exercise: 'Rematore Inverso',
    day: 'Giorno 1',
    sets: '4 x 8-10',
    weight: '20kg',
    reps: '10',
    completed: true,
  },
  {
    id: 'WORK003',
    exercise: "Farmer's Walk",
    day: 'Giorno 1',
    sets: '4 x 40m',
    weight: '16kg',
    reps: '40m',
    completed: true,
  },
  {
    id: 'WORK004',
    exercise: 'Stacchi Rumeni',
    day: 'Giorno 2',
    sets: '4 x 10',
    weight: '40kg',
    reps: '10',
    completed: false,
  },
  {
    id: 'WORK005',
    exercise: 'Affondi Indietro',
    day: 'Giorno 2',
    sets: '3 x 8',
    weight: '10kg',
    reps: '8',
    completed: false,
  },
];

export default function ProgressTable() {
  const [workouts, setWorkouts] = useState(initialWorkoutData);

  const completedCount = workouts.filter(w => w.completed).length;
  const totalWeight = workouts
    .filter(w => w.completed)
    .reduce((sum, workout) => {
      const weight = parseFloat(workout.weight.replace('kg', ''));
      const sets = parseInt(workout.sets.split(' x ')[0]);
      return sum + (weight * sets);
    }, 0);

  const handleDelete = (id) => {
    setWorkouts((prev) => prev.filter((workout) => workout.id !== id));
  };

  const getStatusIcon = (completed) => {
    if (completed) {
      return <FiCheckCircle className="text-green-400" size={18} />;
    }
    return <FiClock className="text-yellow-400" size={18} />;
  };

  const getDayColor = (day) => {
    if (day.includes('Giorno 1')) return 'text-green-400';
    if (day.includes('Giorno 2')) return 'text-blue-400';
    if (day.includes('Giorno 3')) return 'text-yellow-400';
    if (day.includes('Giorno 4')) return 'text-red-400';
    if (day.includes('Giorno 5')) return 'text-orange-400';
    return 'text-gray-400';
  };

  return (
    <div className='w-full max-w-4xl mx-auto px-6'>
      <div className="mb-6 text-center">
        <h3 className="text-2xl font-bold text-white mb-2">I Tuoi Progressi</h3>
        <p className="text-gray-400">Traccia ogni allenamento e monitora i risultati</p>
      </div>

      <Table>
        <TableCaption className="text-gray-400">
          Storico degli allenamenti completati e programmati
        </TableCaption>

        <TableHeader>
          <TableRow>
            <TableHead className='w-[100px]'>ID</TableHead>
            <TableHead>Esercizio</TableHead>
            <TableHead>Giorno</TableHead>
            <TableHead className='text-right'>Serie</TableHead>
            <TableHead className='text-right'>Peso</TableHead>
            <TableHead className='text-right'>Reps</TableHead>
            <TableHead className='text-center'>Stato</TableHead>
            <TableHead className='w-[60px] text-center'>Azioni</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          <AnimatePresence>
            {workouts.map((workout, index) => (
              <motion.tr
                key={workout.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className='border-b border-white/10 transition-colors hover:bg-white/5'
              >
                <TableCell className='font-medium text-gray-400'>{workout.id}</TableCell>
                <TableCell className='text-white font-medium'>{workout.exercise}</TableCell>
                <TableCell className={getDayColor(workout.day)}>{workout.day}</TableCell>
                <TableCell className='text-right text-gray-300'>{workout.sets}</TableCell>
                <TableCell className='text-right text-blue-400 font-medium'>{workout.weight}</TableCell>
                <TableCell className='text-right text-green-400 font-medium'>{workout.reps}</TableCell>
                <TableCell className='text-center'>
                  <div className="flex justify-center">
                    {getStatusIcon(workout.completed)}
                  </div>
                </TableCell>
                <TableCell className='text-center'>
                  <button
                    aria-label={`Delete ${workout.exercise}`}
                    onClick={() => handleDelete(workout.id)}
                    className='p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors'
                  >
                    <FiTrash2 size={16} />
                  </button>
                </TableCell>
              </motion.tr>
            ))}
          </AnimatePresence>
        </TableBody>

        <TableFooter>
          <TableRow>
            <TableCell colSpan={6} className="text-gray-400">
              <div className="flex items-center gap-2">
                <FiActivity className="text-green-400" />
                Totale Allenamenti Completati
              </div>
            </TableCell>
            <TableCell className='text-right text-green-400 font-bold'>
              {completedCount}/{workouts.length}
            </TableCell>
            <TableCell></TableCell>
          </TableRow>
          <TableRow>
            <TableCell colSpan={6} className="text-gray-400">
              Carico Totale Spostato
            </TableCell>
            <TableCell className='text-right text-blue-400 font-bold'>
              {totalWeight.toLocaleString()} kg
            </TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableFooter>
      </Table>

      {workouts.length === 0 && (
        <div className="text-center py-12">
          <FiActivity className="mx-auto text-gray-600 mb-4" size={48} />
          <p className="text-gray-400">Nessun allenamento registrato</p>
          <p className="text-gray-500 text-sm mt-2">Inizia il tuo primo allenamento per vedere i progressi</p>
        </div>
      )}
    </div>
  );
}
