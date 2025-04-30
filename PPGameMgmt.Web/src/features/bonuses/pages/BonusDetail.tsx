import React from 'react';
import { useParams } from 'react-router-dom';

const BonusDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Bonus Details</h1>
      <p className="mb-4">Viewing bonus with ID: {id}</p>
      <div className="bg-gray-100 p-4 rounded-md">
        <p>This is a placeholder component for the Bonus Detail page.</p>
      </div>
    </div>
  );
};

export default BonusDetail;