'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/badge';
import {
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  EyeIcon,
  MapPinIcon,
  InformationCircleIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  PhoneIcon,
  VideoCameraIcon,
  CameraIcon,
  ShareIcon,
  HeartIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

interface TourStop {
  id: string;
  title: string;
  description: string;
  image: string;
  panoramaUrl?: string;
  hotspots?: Hotspot[];
  duration: number; // in seconds
  audioUrl?: string;
}

interface Hotspot {
  id: string;
  x: number; // percentage from left
  y: number; // percentage from top
  title: string;
  description: string;
  type: 'info' | 'navigation' | 'feature';
  targetStopId?: string;
}

interface TourSchedule {
  id: string;
  type: 'virtual' | 'physical';
  date: string;
  time: string;
  duration: number; // in minutes
  agent: {
    name: string;
    phone: string;
    email: string;
    avatar?: string;
  };
  status: 'scheduled' | 'completed' | 'cancelled';
}

interface PropertyTourProps {
  propertyId: string;
  propertyTitle: string;
  className?: string;
}

export default function PropertyTour({
  propertyId,
  propertyTitle,
  className = ''
}: PropertyTourProps) {
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showHotspots, setShowHotspots] = useState(true);
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [tourSchedules, setTourSchedules] = useState<TourSchedule[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  // Mock tour data - replace with actual API calls
  const tourStops: TourStop[] = [
    {
      id: '1',
      title: 'Grand Entrance',
      description: 'Welcome to this stunning property. The grand entrance features marble flooring and a beautiful chandelier.',
      image: '/tour-images/entrance.jpg',
      panoramaUrl: '/panoramas/entrance-360.jpg',
      duration: 30,
      audioUrl: '/audio/entrance-narration.mp3',
      hotspots: [
        {
          id: 'h1',
          x: 25,
          y: 40,
          title: 'Chandelier',
          description: 'Crystal chandelier imported from Italy',
          type: 'feature'
        },
        {
          id: 'h2',
          x: 70,
          y: 60,
          title: 'Living Room',
          description: 'Continue to the spacious living room',
          type: 'navigation',
          targetStopId: '2'
        }
      ]
    },
    {
      id: '2',
      title: 'Living Room',
      description: 'Spacious living room with floor-to-ceiling windows offering natural light throughout the day.',
      image: '/tour-images/living-room.jpg',
      panoramaUrl: '/panoramas/living-room-360.jpg',
      duration: 45,
      audioUrl: '/audio/living-room-narration.mp3',
      hotspots: [
        {
          id: 'h3',
          x: 15,
          y: 30,
          title: 'Fireplace',
          description: 'Modern gas fireplace with marble surround',
          type: 'feature'
        },
        {
          id: 'h4',
          x: 80,
          y: 50,
          title: 'Kitchen',
          description: 'Modern kitchen with island',
          type: 'navigation',
          targetStopId: '3'
        }
      ]
    },
    {
      id: '3',
      title: 'Modern Kitchen',
      description: 'State-of-the-art kitchen with granite countertops, stainless steel appliances, and a large island.',
      image: '/tour-images/kitchen.jpg',
      panoramaUrl: '/panoramas/kitchen-360.jpg',
      duration: 40,
      audioUrl: '/audio/kitchen-narration.mp3',
      hotspots: [
        {
          id: 'h5',
          x: 40,
          y: 35,
          title: 'Kitchen Island',
          description: 'Large granite island with bar seating',
          type: 'feature'
        },
        {
          id: 'h6',
          x: 60,
          y: 70,
          title: 'Master Bedroom',
          description: 'Luxurious master bedroom suite',
          type: 'navigation',
          targetStopId: '4'
        }
      ]
    },
    {
      id: '4',
      title: 'Master Bedroom',
      description: 'Luxurious master bedroom with walk-in closet and en-suite bathroom.',
      image: '/tour-images/bedroom.jpg',
      panoramaUrl: '/panoramas/bedroom-360.jpg',
      duration: 35,
      audioUrl: '/audio/bedroom-narration.mp3',
      hotspots: [
        {
          id: 'h7',
          x: 30,
          y: 45,
          title: 'Walk-in Closet',
          description: 'Spacious walk-in closet with custom shelving',
          type: 'feature'
        },
        {
          id: 'h8',
          x: 75,
          y: 55,
          title: 'En-suite Bathroom',
          description: 'Luxury bathroom with marble finishes',
          type: 'navigation',
          targetStopId: '5'
        }
      ]
    },
    {
      id: '5',
      title: 'Master Bathroom',
      description: 'Spa-like master bathroom with marble finishes, double vanity, and soaking tub.',
      image: '/tour-images/bathroom.jpg',
      panoramaUrl: '/panoramas/bathroom-360.jpg',
      duration: 25,
      audioUrl: '/audio/bathroom-narration.mp3',
      hotspots: [
        {
          id: 'h9',
          x: 45,
          y: 40,
          title: 'Soaking Tub',
          description: 'Deep soaking tub with city views',
          type: 'feature'
        }
      ]
    }
  ];

  const currentStop = tourStops[currentStopIndex];

  useEffect(() => {
    if (isPlaying && currentStop.audioUrl && audioRef.current) {
      audioRef.current.play();
      startProgressTracking();
    } else if (audioRef.current) {
      audioRef.current.pause();
      stopProgressTracking();
    }

    return () => stopProgressTracking();
  }, [isPlaying, currentStopIndex]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const startProgressTracking = () => {
    progressInterval.current = setInterval(() => {
      if (audioRef.current) {
        const currentTime = audioRef.current.currentTime;
        const duration = audioRef.current.duration;
        setProgress((currentTime / duration) * 100);
        
        if (currentTime >= duration) {
          handleNext();
        }
      }
    }, 100);
  };

  const stopProgressTracking = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
  };

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (currentStopIndex < tourStops.length - 1) {
      setCurrentStopIndex(currentStopIndex + 1);
      setProgress(0);
    } else {
      setIsPlaying(false);
      setProgress(0);
    }
  };

  const handlePrevious = () => {
    if (currentStopIndex > 0) {
      setCurrentStopIndex(currentStopIndex - 1);
      setProgress(0);
    }
  };

  const handleStopSelect = (index: number) => {
    setCurrentStopIndex(index);
    setProgress(0);
  };

  const handleHotspotClick = (hotspot: Hotspot) => {
    if (hotspot.type === 'navigation' && hotspot.targetStopId) {
      const targetIndex = tourStops.findIndex(stop => stop.id === hotspot.targetStopId);
      if (targetIndex !== -1) {
        handleStopSelect(targetIndex);
      }
    } else {
      setSelectedHotspot(hotspot);
    }
  };

  const scheduleTour = (type: 'virtual' | 'physical', date: string, time: string) => {
    const newSchedule: TourSchedule = {
      id: Date.now().toString(),
      type,
      date,
      time,
      duration: type === 'virtual' ? 30 : 60,
      agent: {
        name: 'Sarah Johnson',
        phone: '+254 700 123 456',
        email: 'sarah@realestate.com',
        avatar: '/agents/sarah.jpg'
      },
      status: 'scheduled'
    };

    setTourSchedules([...tourSchedules, newSchedule]);
    setShowScheduleModal(false);
  };

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      {/* Tour Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Virtual Property Tour</h2>
            <p className="text-gray-600 mt-1">{propertyTitle}</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowScheduleModal(true)}
            >
              <CalendarIcon className="w-5 h-5 mr-2" />
              Schedule Tour
            </Button>
            
            <Button variant="outline">
              <ShareIcon className="w-5 h-5 mr-2" />
              Share
            </Button>
            
            <Button variant="outline">
              <HeartIcon className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Tour Viewer */}
      <div className="relative">
        {/* Main Tour Image/Panorama */}
        <div className="relative aspect-video bg-gray-900">
          <img
            src={currentStop.image}
            alt={currentStop.title}
            className="w-full h-full object-cover"
          />
          
          {/* Hotspots */}
          {showHotspots && currentStop.hotspots?.map((hotspot) => (
            <button
              key={hotspot.id}
              onClick={() => handleHotspotClick(hotspot)}
              className="absolute w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white hover:bg-green-700 transition-colors animate-pulse"
              style={{
                left: `${hotspot.x}%`,
                top: `${hotspot.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              {hotspot.type === 'navigation' ? (
                <ArrowRightIcon className="w-4 h-4" />
              ) : (
                <InformationCircleIcon className="w-4 h-4" />
              )}
            </button>
          ))}
          
          {/* Tour Controls Overlay */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-black bg-opacity-75 rounded-lg p-4">
              {/* Progress Bar */}
              <div className="w-full bg-gray-600 rounded-full h-2 mb-4">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-100"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevious}
                    disabled={currentStopIndex === 0}
                    className="bg-white bg-opacity-20 text-white border-white border-opacity-30"
                  >
                    <ChevronLeftIcon className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePlay}
                    className="bg-white bg-opacity-20 text-white border-white border-opacity-30"
                  >
                    {isPlaying ? (
                      <PauseIcon className="w-4 h-4" />
                    ) : (
                      <PlayIcon className="w-4 h-4" />
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNext}
                    disabled={currentStopIndex === tourStops.length - 1}
                    className="bg-white bg-opacity-20 text-white border-white border-opacity-30"
                  >
                    <ChevronRightIcon className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsMuted(!isMuted)}
                    className="bg-white bg-opacity-20 text-white border-white border-opacity-30"
                  >
                    {isMuted ? (
                      <SpeakerXMarkIcon className="w-4 h-4" />
                    ) : (
                      <SpeakerWaveIcon className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                
                <div className="text-white text-sm">
                  {currentStopIndex + 1} of {tourStops.length}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Audio Element */}
        {currentStop.audioUrl && (
          <audio
            ref={audioRef}
            src={currentStop.audioUrl}
            onEnded={handleNext}
          />
        )}
      </div>

      {/* Tour Information */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Stop Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <Badge className="bg-green-100 text-green-800">
                Stop {currentStopIndex + 1}
              </Badge>
              <h3 className="text-xl font-semibold text-gray-900">
                {currentStop.title}
              </h3>
            </div>
            
            <p className="text-gray-600 mb-4">
              {currentStop.description}
            </p>
            
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <ClockIcon className="w-4 h-4 mr-1" />
                {currentStop.duration}s
              </div>
              
              <div className="flex items-center">
                <EyeIcon className="w-4 h-4 mr-1" />
                {currentStop.hotspots?.length || 0} hotspots
              </div>
            </div>
          </div>
          
          {/* Tour Navigation */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Tour Stops</h4>
            <div className="space-y-2">
              {tourStops.map((stop, index) => (
                <button
                  key={stop.id}
                  onClick={() => handleStopSelect(index)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    index === currentStopIndex
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      index === currentStopIndex
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{stop.title}</div>
                      <div className="text-xs text-gray-500">{stop.duration}s</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hotspot Modal */}
      {selectedHotspot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedHotspot.title}
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedHotspot(null)}
                >
                  <XMarkIcon className="w-5 h-5" />
                </Button>
              </div>
              
              <p className="text-gray-600 mb-4">
                {selectedHotspot.description}
              </p>
              
              <div className="flex justify-end">
                <Button onClick={() => setSelectedHotspot(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Tour Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Schedule Property Tour
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowScheduleModal(false)}
                >
                  <XMarkIcon className="w-5 h-5" />
                </Button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Virtual Tour */}
                <Card className="p-6 border-2 border-green-200 bg-green-50">
                  <div className="text-center">
                    <VideoCameraIcon className="w-12 h-12 text-green-600 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      Virtual Tour
                    </h4>
                    <p className="text-gray-600 text-sm mb-4">
                      Live video tour with our agent via video call
                    </p>
                    
                    <div className="space-y-3 mb-4">
                      <Input type="date" />
                      <Input type="time" />
                    </div>
                    
                    <Button
                      className="w-full"
                      onClick={() => scheduleTour('virtual', '2024-01-25', '14:00')}
                    >
                      Schedule Virtual Tour
                    </Button>
                  </div>
                </Card>
                
                {/* Physical Tour */}
                <Card className="p-6 border-2 border-blue-200 bg-blue-50">
                  <div className="text-center">
                    <MapPinIcon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      Physical Tour
                    </h4>
                    <p className="text-gray-600 text-sm mb-4">
                      In-person tour of the property with our agent
                    </p>
                    
                    <div className="space-y-3 mb-4">
                      <Input type="date" />
                      <Input type="time" />
                    </div>
                    
                    <Button
                      className="w-full"
                      onClick={() => scheduleTour('physical', '2024-01-25', '15:00')}
                    >
                      Schedule Physical Tour
                    </Button>
                  </div>
                </Card>
              </div>
              
              {/* Scheduled Tours */}
              {tourSchedules.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Scheduled Tours</h4>
                  <div className="space-y-3">
                    {tourSchedules.map((schedule) => (
                      <div key={schedule.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          {schedule.type === 'virtual' ? (
                            <VideoCameraIcon className="w-5 h-5 text-green-600" />
                          ) : (
                            <MapPinIcon className="w-5 h-5 text-blue-600" />
                          )}
                          <div>
                            <div className="font-medium text-gray-900">
                              {schedule.type === 'virtual' ? 'Virtual' : 'Physical'} Tour
                            </div>
                            <div className="text-sm text-gray-600">
                              {schedule.date} at {schedule.time} ({schedule.duration} min)
                            </div>
                          </div>
                        </div>
                        
                        <Badge className={
                          schedule.status === 'scheduled' ? 'bg-green-100 text-green-800' :
                          schedule.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }>
                          {schedule.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
