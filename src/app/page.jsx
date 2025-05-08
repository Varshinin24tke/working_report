'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import 'leaflet/dist/leaflet.css';

const MapClient = dynamic(() => import('./MapClient'), { ssr: false });

const ReportPage = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchError, setSearchError] = useState('');
  const [description, setDescription] = useState('');
  const [submitMessage, setSubmitMessage] = useState('');
  const searchParams = useSearchParams();
  const userId = searchParams.get('userid');

  const handleSearch = async () => {
    if (!searchQuery) return;
    try {
      const fullQuery = `${searchQuery}, India`;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullQuery)}`
      );
      const data = await response.json();
      if (data.length > 0) {
        const { lat, lon } = data[0];
        setSelectedLocation({ lat: parseFloat(lat), lng: parseFloat(lon) });
        setSearchError('');
      } else {
        setSearchError('❌ Location not found.');
      }
    } catch (err) {
      console.error(err);
      setSearchError('❌ Search failed.');
    }
  };

  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setSelectedLocation({ lat: latitude, lng: longitude });
          setSearchError('');
        },
        (err) => {
          console.error(err);
          setSearchError('❌ Failed to access your location.');
        }
      );
    } else {
      setSearchError('❌ Geolocation not supported.');
    }
  };

  const handleSubmit = async () => {
    if (!userId || !description || !selectedLocation) {
      setSubmitMessage('❌ Please fill all fields and allow location.');
      return;
    }

    const body = {
      userid: userId,
      description: description,
      latt: selectedLocation.lat,
      long: selectedLocation.lng,
    };

    try {
      const response = await fetch('https://yashdb18-hersafety.hf.space/app/save_review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setSubmitMessage('✅ Report submitted successfully!');
        setDescription('');
      } else {
        setSubmitMessage('❌ Failed to submit the report.');
      }
    } catch (error) {
      console.error(error);
      setSubmitMessage('❌ An error occurred during submission.');
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 p-4 md:p-6 max-w-xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 text-pink-600">📍 Report a Place</h1>

      <div className="flex flex-col sm:flex-row gap-2 mb-2">
        <input
          type="text"
          placeholder="Search for a location"
          className="text-black p-2 rounded border w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded"
          onClick={handleSearch}
        >
          Search
        </button>
      </div>

      {searchError && <p className="text-red-500 font-medium mb-2">{searchError}</p>}

      <button
        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded mb-4 w-full"
        onClick={handleUseMyLocation}
      >
        📍 Use My Location
      </button>

      <MapClient
        onLocationSelect={setSelectedLocation}
        currentLocation={selectedLocation}
      />

      {selectedLocation && (
        <p className="text-green-600 font-medium mt-2">
          📌 Selected Location: {selectedLocation.lat.toFixed(5)}, {selectedLocation.lng.toFixed(5)}
        </p>
      )}

      <div className="mt-6 space-y-4">
        <div>
          <label className="block mb-1 font-semibold">Description</label>
          <textarea
            className="w-full p-2 border rounded text-black"
            placeholder="Describe the issue here..."
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <button
          className="bg-pink-600 hover:bg-pink-700 text-white font-semibold py-2 px-4 rounded w-full"
          onClick={handleSubmit}
        >
          🚨 Submit Report
        </button>

        {submitMessage && <p className="text-sm font-medium mt-2">{submitMessage}</p>}
      </div>
    </div>
  );
};

export default ReportPage;
