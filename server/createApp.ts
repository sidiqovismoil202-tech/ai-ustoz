import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

export function createApp() {
  const app = express();

  // Increase payload limit for high-res photo uploads
  app.use(express.json({ limit: '35mb' }));
  app.use(express.urlencoded({ extended: true, limit: '35mb' }));

  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({
    apiKey: apiKey || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // Resilient Gemini generateContent with auto-retry and model fallback
  async function generateContentResilient(params: any) {
    const modelsToTry = ['gemini-3.8-flash', 'gemini-flash-latest'];
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          return await ai.models.generateContent({
            ...params,
            model: modelName,
          });
        } catch (err: any) {
          lastError = err;
          const errMsg = String(err?.message || '');
          const isTransient =
            errMsg.includes('503') ||
            errMsg.includes('429') ||
            errMsg.includes('UNAVAILABLE') ||
            errMsg.includes('high demand') ||
            errMsg.includes('RESOURCE_EXHAUSTED');

          if (isTransient && attempt < 2) {
            console.log(`[Gemini Retry] Model ${modelName} transient issue, retrying in ${(attempt + 1) * 1.5}s...`);
            await new Promise((resolve) => setTimeout(resolve, (attempt + 1) * 1500));
            continue;
          }
          break;
        }
      }
    }
    throw lastError;
  }

  // Health endpoint (supports both /api/health and /health)
  app.get(['/api/health', '/health'], (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      hasApiKey: !!process.env.GEMINI_API_KEY,
      model: 'gemini-3.8-flash',
      appName: 'AI Ustoz',
    });
  });

  // Solve endpoint (supports both /api/solve and /solve)
  app.post(['/api/solve', '/solve'], async (req: Request, res: Response) => {
    try {
      const { imageBase64, mimeType = 'image/jpeg', userPrompt = '' } = req.body;

      if (!imageBase64) {
        return res.status(400).json({
          error: "Rasm yuklanmadi. Iltimos, vazifa rasmini tanlang yoki kameradan oling.",
        });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({
          error: "GEMINI_API_KEY sozlanmagan. Iltimos, Vercel Environment Variables bo'limida GEMINI_API_KEY ni sozlang.",
        });
      }

      // Strip potential data URL prefix if present
      let cleanBase64 = imageBase64;
      let cleanMimeType = mimeType;
      if (imageBase64.includes(';base64,')) {
        const parts = imageBase64.split(';base64,');
        const mimeMatch = parts[0].match(/data:(.*?)$/);
        if (mimeMatch && mimeMatch[1]) {
          cleanMimeType = mimeMatch[1];
        }
        cleanBase64 = parts[1];
      }

      // Ensure valid standard image MIME type for Gemini
      const supportedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
      if (!supportedMimes.includes(cleanMimeType.toLowerCase())) {
        cleanMimeType = 'image/jpeg';
      }

      const promptText = `Ushbu rasmdagi uy vazifasi yoki test savolini diqqat bilan tahlil qiling va eng to'g'ri, tushunarli yechimni taqdim eting.

Qo'shimcha foydalanuvchi iltimosi: ${userPrompt ? `"${userPrompt}"` : "Yo'q"}

Talablar:
1. Rasmni to'liq ko'zdan kechiring. Agar rasm xira bo'lsa yoki savol matni o'qilmasa, 'isReadable: false' deb belgilang va 'unclearReason' da qaysi qismi ko'rinmayotganini aniq tushuntiring. Hech qachon o'zingizdan to'qib chiqarmang.
2. Savol qaysi fanga oidligini aniqlang (Masalan: Matematika, Fizika, Kimyo, Biologiya, Geografiya, Tarix, Ingliz tili, Ona tili va adabiyot, Boshqa).
3. Savol tilini aniqlang.
4. Agar rasmda bir nechta topshiriq (masalan, 1-masala, 2-masala yoki a, b, c) bo'lsa, ularning har birini alohida raqamlab yeching.
5. Matematika yoki aniq fanlar bo'lsa:
   - Bosqichma-bosqich yechimni ('steps') ko'rsating.
   - Har bir qadamda nima qilinganini, qo'llangan formula yoki qoidani ko'rsating.
   - Hisob-kitoblarni 2 marta qayta tekshirib, yakuniy javobning to'g'riligiga ishonch hosil qiling.
6. Test savoli (variantli) bo'lsa:
   - 'isMultipleChoice: true' qiling.
   - 'correctOption' ga to'g'ri variant harfi va matnini yozing (masalan, "B) 45°").
   - 'explanation' da nima uchun bu variant to'g'riligini va boshqa variantlar nega noto'g'riligini qisqacha izohlang.
7. Yakuniy javobni ('finalAnswer') o'quvchi bir qarashda tushunishi uchun aniq va ixcham qilib ajrating.
8. Barcha tushuntirish va izohlarni o'zbek tilida, tushunarli, do'stona va professional pedagogik uslubda bayon eting.`;

      const response = await generateContentResilient({
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: cleanMimeType,
                data: cleanBase64,
              },
            },
            {
              text: promptText,
            },
          ],
        },
        config: {
          systemInstruction:
            "Siz 'AI Ustoz' - tajribali, o'quvchilarga mehribon va o'ta bilimdon virtual o'qituvchisiz. Sizning asosiy maqsadingiz o'quvchiga uy vazifasini mustaqil tushunib yechishga yordam berish. Xatolarga yo'l qo'ymang, hisob-kitoblarni sinchkovlik bilan tekshiring. Javoblaringiz chiroyli, tartibli va tushunarli bo'lsin.",
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isReadable: {
                type: Type.BOOLEAN,
                description: "Rasm va undagi savol matni o'qilishi mumkinmi?",
              },
              unclearReason: {
                type: Type.STRING,
                description: "Agar rasm o'qilmasa, sababi va maslahat",
              },
              detectedSubject: {
                type: Type.STRING,
                description: "Fan nomi (Matematika, Fizika, Kimyo, Ingliz tili va h.k.)",
              },
              detectedLanguage: {
                type: Type.STRING,
                description: "Savol yozilgan til",
              },
              summary: {
                type: Type.STRING,
                description: "Savol haqida qisqacha xulosa (1-2 gap)",
              },
              questions: {
                type: Type.ARRAY,
                description: "Rasm ichidagi har bir savol yoki topshiriq yechimi",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    questionNumber: {
                      type: Type.INTEGER,
                      description: "Savol raqami (1, 2, 3...)",
                    },
                    questionText: {
                      type: Type.STRING,
                      description: "Rasmda yozilgan asl savol matni yoki topshiriq",
                    },
                    isMultipleChoice: {
                      type: Type.BOOLEAN,
                      description: "Variantli test savolimi?",
                    },
                    correctOption: {
                      type: Type.STRING,
                      description: "To'g'ri variant (masalan: 'C' yoki 'C) 24 sm')",
                    },
                    finalAnswer: {
                      type: Type.STRING,
                      description: "Aniq va qisqa yakuniy javob",
                    },
                    steps: {
                      type: Type.ARRAY,
                      description: "Bosqichma-bosqich yechish qadamlari",
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          stepNumber: { type: Type.INTEGER },
                          title: { type: Type.STRING },
                          explanation: { type: Type.STRING },
                          formulaOrEquation: { type: Type.STRING },
                        },
                        required: ['stepNumber', 'title', 'explanation'],
                      },
                    },
                    explanation: {
                      type: Type.STRING,
                      description: "Umumiy tushuntirish va mantiqiy asoslash",
                    },
                    keyConceptOrFormula: {
                      type: Type.STRING,
                      description: "Mavzuga oid asosiy qoida, teorema yoki formula",
                    },
                  },
                  required: ['questionNumber', 'questionText', 'finalAnswer', 'steps', 'explanation'],
                },
              },
              tipsOrNotes: {
                type: Type.STRING,
                description: "O'quvchi uchun foydali maslahat yoki eslatma",
              },
              practiceQuestion: {
                type: Type.OBJECT,
                description: "Mavzuni mustahkamlash uchun o'xshash mashq",
                properties: {
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctAnswer: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                },
                required: ['question', 'correctAnswer', 'explanation'],
              },
            },
            required: ['isReadable', 'detectedSubject', 'detectedLanguage', 'summary', 'questions'],
          },
        },
      });

      const rawText = response.text || '{}';
      let parsedData;
      try {
        parsedData = JSON.parse(rawText);
      } catch (parseErr) {
        console.error('Failed to parse Gemini JSON response:', rawText);
        return res.status(500).json({
          error: "AI javobini qayta ishlashda xatolik yuz berdi. Qayta urinib ko'ring.",
          raw: rawText,
        });
      }

      return res.json({
        success: true,
        data: parsedData,
      });
    } catch (err: any) {
      console.error('Gemini solve error:', err);
      const errorMessage =
        err?.message || "Savolni yechishda kutilmagan xatolik yuz berdi. Iltimos, qayta urinib ko'ring.";
      return res.status(500).json({ error: errorMessage });
    }
  });

  // Follow-up question chat endpoint
  app.post(['/api/follow-up', '/follow-up'], async (req: Request, res: Response) => {
    try {
      const { questionContext, userQuestion, previousAnswer } = req.body;

      if (!userQuestion) {
        return res.status(400).json({ error: "Savol matni kiritilmadi." });
      }

      const prompt = `Foydalanuvchi (o'quvchi) oldingi yechilgan vazifa bo'yicha qo'shimcha savol berdi.
O'quvchi savoli: "${userQuestion}"

Vazifa konteksti:
${questionContext || "Oldingi masala"}

Oldingi yechim xulosasi:
${previousAnswer || ""}

Vazifangiz:
O'quvchining savoliga o'zbek tilida juda sodda, samimiy va tushunarli tarzda javob bering. Misollar keltiring, kerak bo'lsa hayotiy misol bilan tushuntiring.`;

      const response = await generateContentResilient({
        contents: prompt,
        config: {
          systemInstruction:
            "Siz 'AI Ustoz' yordamchisiz. O'quvchilarga sabr-toqat va mehr bilan tushunmagan joylarini sodda tilda tushuntirasiz.",
        },
      });

      return res.json({
        success: true,
        reply: response.text || "Kechirasiz, javob shakllanmadi.",
      });
    } catch (err: any) {
      console.error('Follow-up error:', err);
      return res.status(500).json({
        error: err?.message || "Javob berishda xatolik yuz berdi.",
      });
    }
  });

  return app;
}
