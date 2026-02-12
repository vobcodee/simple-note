'use client';

import { useState } from 'react';
import { testAuthAction } from '../notes/test-action';

export default function TestAuthPage() {
  const [result, setResult] = useState<any>(null);

  const handleTest = async () => {
    console.log('[CLIENT] Testing auth...');
    const res = await testAuthAction();
    console.log('[CLIENT] Result:', res);
    setResult(res);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Auth Test</h1>
      <button 
        onClick={handleTest}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Test Server Action
      </button>
      
      {result && (
        <pre className="mt-4 p-4 bg-gray-100 rounded">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
