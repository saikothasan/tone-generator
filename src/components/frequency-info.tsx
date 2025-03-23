"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Info, Music, Brain, Speaker, Ear } from "lucide-react"

interface FrequencyInfoProps {
  frequency: number
}

export default function FrequencyInfo({ frequency }: FrequencyInfoProps) {
  // Get information about the current frequency
  const getFrequencyInfo = () => {
    if (frequency < 20) {
      return {
        category: "Infrasound",
        description: "Below the range of human hearing, but can be felt as vibrations.",
        examples: ["Earthquakes", "Whale communication", "Building vibrations"],
        notes: "Can cause feelings of unease or discomfort in some people.",
      }
    } else if (frequency < 60) {
      return {
        category: "Sub-bass",
        description: "The lowest frequencies audible to humans, felt more than heard.",
        examples: ["Bass drums", "Pipe organ lowest notes", "Thunder"],
        notes: "Creates a sense of power and physical impact in music.",
      }
    } else if (frequency < 250) {
      return {
        category: "Bass",
        description: "Provides the foundation for music and gives sounds their power.",
        examples: ["Bass guitar", "Tuba", "Kick drums"],
        notes: "Too much can make audio sound muddy, too little makes it thin.",
      }
    } else if (frequency < 500) {
      return {
        category: "Lower midrange",
        description: "Adds warmth and fullness to sounds.",
        examples: ["Male vocals", "Guitar body resonance", "Piano lower register"],
        notes: "Critical for the perceived warmth of music.",
      }
    } else if (frequency < 2000) {
      return {
        category: "Midrange",
        description: "Where most musical instruments and vocals have their fundamental frequencies.",
        examples: ["Vocals", "Piano", "Guitar", "Most melody instruments"],
        notes: "The most sensitive range for human hearing.",
      }
    } else if (frequency < 4000) {
      return {
        category: "Upper midrange",
        description: "Adds presence and definition to sounds.",
        examples: ["Speech consonants", "Snare drums", "Guitar attack"],
        notes: "Critical for speech intelligibility.",
      }
    } else if (frequency < 10000) {
      return {
        category: "Presence/Lower treble",
        description: "Adds clarity and definition to sounds.",
        examples: ["Cymbals", "Hi-hats", "Sibilance in vocals"],
        notes: "Too much can cause listening fatigue.",
      }
    } else if (frequency <= 20000) {
      return {
        category: "Brilliance/Air",
        description: "Adds sparkle, air, and openness to sounds.",
        examples: ["Cymbal shimmer", "Ambient room sound", "Harmonics of instruments"],
        notes: "First to be lost with age-related hearing loss.",
      }
    } else {
      return {
        category: "Ultrasound",
        description: "Above the range of human hearing.",
        examples: ["Bat echolocation", "Dog whistles", "Medical ultrasound"],
        notes: "Used in medical imaging and industrial applications.",
      }
    }
  }

  // Get therapeutic information
  const getTherapeuticInfo = () => {
    if (frequency < 4) {
      return {
        category: "Delta waves (0.5-4 Hz)",
        description: "Associated with deep sleep and healing.",
        uses: ["Deep meditation", "Healing", "Dreamless sleep"],
        notes: "Not directly audible, but can be experienced through binaural beats.",
      }
    } else if (frequency < 8) {
      return {
        category: "Theta waves (4-8 Hz)",
        description: "Associated with deep relaxation, meditation, and creativity.",
        uses: ["Meditation", "Creative visualization", "REM sleep"],
        notes: "Not directly audible, but can be experienced through binaural beats.",
      }
    } else if (frequency < 14) {
      return {
        category: "Alpha waves (8-14 Hz)",
        description: "Associated with relaxed alertness and calmness.",
        uses: ["Relaxation", "Stress reduction", "Light meditation"],
        notes: "Not directly audible, but can be experienced through binaural beats.",
      }
    } else if (frequency < 30) {
      return {
        category: "Beta waves (14-30 Hz)",
        description: "Associated with active thinking and focus.",
        uses: ["Concentration", "Problem solving", "Active mental work"],
        notes: "Not directly audible, but can be experienced through binaural beats.",
      }
    } else if (frequency < 100) {
      return {
        category: "Low frequency",
        description: "Associated with grounding and physical sensations.",
        uses: ["Grounding practices", "Physical relaxation", "Vibrational therapy"],
        notes: "Can be felt physically in the body.",
      }
    } else if (frequency === 432) {
      return {
        category: "Alternative tuning",
        description: "Some believe 432 Hz tuning to be more harmonious with nature.",
        uses: ["Alternative music tuning", "Meditation music", "Sound healing"],
        notes: "Scientific evidence is limited, but many report subjective benefits.",
      }
    } else if (frequency === 528) {
      return {
        category: "Solfeggio frequency",
        description: "Known as the 'love frequency' or 'miracle tone' in some traditions.",
        uses: ["DNA repair (claimed)", "Transformation", "Sound healing"],
        notes: "Part of the ancient Solfeggio scale, though scientific evidence is limited.",
      }
    } else {
      return {
        category: "General frequency",
        description: "Different frequencies can have various effects on mood and physiology.",
        uses: ["Sound therapy", "Relaxation", "Focus"],
        notes: "Effects vary by individual and context.",
      }
    }
  }

  // Get musical information
  const getMusicalInfo = () => {
    const a4 = 440
    const noteNames = ["C", "C#/Db", "D", "D#/Eb", "E", "F", "F#/Gb", "G", "G#/Ab", "A", "A#/Bb", "B"]

    // Calculate how many half steps away from A4
    const halfStepsFromA4 = Math.log2(frequency / a4) * 12

    // Calculate octave and note index
    const octave = 4 + Math.floor((halfStepsFromA4 + 9) / 12)
    let noteIndex = Math.round(halfStepsFromA4) % 12
    if (noteIndex < 0) noteIndex += 12

    // Calculate cents deviation from perfect pitch
    const perfectFreq = a4 * Math.pow(2, halfStepsFromA4 / 12)
    const cents = Math.round(Math.log2(frequency / perfectFreq) * 1200)

    const closestNote = `${noteNames[noteIndex]}${octave}`

    // Get instrument that plays this note
    let instruments = []
    if (frequency < 30) {
      instruments = ["Lowest pipe organ notes", "Synthesizers"]
    } else if (frequency < 60) {
      instruments = ["Contrabass", "Bass guitar (low E)", "Piano (lowest notes)"]
    } else if (frequency < 120) {
      instruments = ["Bass guitar", "Cello", "Tuba", "Bass voice"]
    } else if (frequency < 250) {
      instruments = ["Guitar (low strings)", "Tenor voice", "Trombone"]
    } else if (frequency < 500) {
      instruments = ["Guitar", "Alto voice", "Viola", "Clarinet (low)"]
    } else if (frequency < 1000) {
      instruments = ["Soprano voice", "Violin", "Flute (low register)"]
    } else if (frequency < 2000) {
      instruments = ["Violin (high notes)", "Flute", "Piccolo (low notes)"]
    } else if (frequency < 4000) {
      instruments = ["Piccolo", "Harmonics of most instruments"]
    } else {
      instruments = ["Harmonics and overtones only"]
    }

    return {
      note: closestNote,
      deviation: cents !== 0 ? `${cents > 0 ? "+" : ""}${cents} cents` : "Perfect pitch",
      instruments: instruments,
      frequency: Math.round(perfectFreq * 100) / 100,
    }
  }

  const info = getFrequencyInfo()
  const therapeutic = getTherapeuticInfo()
  const musical = getMusicalInfo()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          Frequency Information
        </CardTitle>
        <CardDescription>Learn about the properties and uses of {frequency} Hz</CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="general">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="general" className="flex items-center gap-1">
              <Speaker className="h-4 w-4" />
              <span>General</span>
            </TabsTrigger>
            <TabsTrigger value="musical" className="flex items-center gap-1">
              <Music className="h-4 w-4" />
              <span>Musical</span>
            </TabsTrigger>
            <TabsTrigger value="therapeutic" className="flex items-center gap-1">
              <Brain className="h-4 w-4" />
              <span>Therapeutic</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div>
              <h3 className="font-medium text-lg">{info.category}</h3>
              <p className="text-sm mt-1">{info.description}</p>
            </div>

            <div>
              <h4 className="font-medium">Common Examples:</h4>
              <ul className="list-disc list-inside text-sm mt-1">
                {info.examples.map((example, index) => (
                  <li key={index}>{example}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-medium">Notes:</h4>
              <p className="text-sm mt-1">{info.notes}</p>
            </div>
          </TabsContent>

          <TabsContent value="musical" className="space-y-4">
            <div>
              <h3 className="font-medium text-lg">Musical Note: {musical.note}</h3>
              <p className="text-sm mt-1">
                Closest perfect pitch: {musical.frequency} Hz ({musical.deviation})
              </p>
            </div>

            <div>
              <h4 className="font-medium">Common Instruments in this Range:</h4>
              <ul className="list-disc list-inside text-sm mt-1">
                {musical.instruments.map((instrument, index) => (
                  <li key={index}>{instrument}</li>
                ))}
              </ul>
            </div>

            <div className="text-sm text-muted-foreground mt-2">
              <p>The standard tuning reference is A4 = 440 Hz (concert pitch).</p>
              <p>Each octave represents a doubling of frequency.</p>
            </div>
          </TabsContent>

          <TabsContent value="therapeutic" className="space-y-4">
            <div>
              <h3 className="font-medium text-lg">{therapeutic.category}</h3>
              <p className="text-sm mt-1">{therapeutic.description}</p>
            </div>

            <div>
              <h4 className="font-medium">Potential Uses:</h4>
              <ul className="list-disc list-inside text-sm mt-1">
                {therapeutic.uses.map((use, index) => (
                  <li key={index}>{use}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-medium">Notes:</h4>
              <p className="text-sm mt-1">{therapeutic.notes}</p>
            </div>

            <div className="text-sm text-muted-foreground mt-2 p-2 border rounded-md">
              <p className="font-medium flex items-center gap-1">
                <Ear className="h-4 w-4" /> Important Note:
              </p>
              <p className="mt-1">
                Therapeutic claims about specific frequencies vary in scientific support. Individual experiences may
                vary, and sound therapy should complement, not replace, professional medical care.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

