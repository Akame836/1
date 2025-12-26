
import { GoogleGenAI, Type } from "@google/genai";
import { Dish, Nutrition, OrderRecord, MealType } from "../types";

// Always use { apiKey: process.env.API_KEY } directly as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const parseMenuImage = async (base64Image: string): Promise<{ storeName: string; dishes: Partial<Dish>[] }> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
        { 
          text: `从这张外卖菜单图片中识别店铺名称和所有菜品。
          【重要】关于价格：请提取菜品的“优惠后价格”或“实际支付价格”。如果图中存在原价（划线价）和折扣价，请务必只提取折扣价。
          如果没有标明配送时间，请根据经验估算（如 30-50 分钟）。
          输出必须是 JSON 格式。` 
        },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          storeName: { type: Type.STRING },
          dishes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                price: { type: Type.NUMBER, description: "优惠后的实付价格" },
                deliveryTimeMinutes: { type: Type.NUMBER },
                category: { type: Type.STRING }
              },
              required: ["name", "price"]
            }
          }
        },
        required: ["storeName", "dishes"]
      }
    }
  });
  return JSON.parse(response.text.trim());
};

export const parseOrderScreenshot = async (base64Image: string): Promise<(Omit<OrderRecord, 'id' | 'date' | 'mealType'>)[]> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
        { 
          text: `识别这张外卖订单中的菜品、店铺和价格。
          【重要】提取“实付金额”。如果订单中有满减、红包后的最终单价，请提取该最终价格。
          同时估算营养成分：卡路里(calories), 蛋白质(protein), 碳水(carbs), 脂肪(fat)。
          以 JSON 数组格式输出。` 
        },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            dishName: { type: Type.STRING },
            storeName: { type: Type.STRING },
            price: { type: Type.NUMBER, description: "最终实付金额" },
            nutrition: {
              type: Type.OBJECT,
              properties: {
                calories: { type: Type.NUMBER },
                protein: { type: Type.NUMBER },
                carbs: { type: Type.NUMBER },
                fat: { type: Type.NUMBER }
              }
            }
          }
        }
      }
    }
  });
  return JSON.parse(response.text.trim());
};

export const analyzeFoodImage = async (base64Image: string): Promise<{ dishName: string; nutrition: Nutrition }> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
        { text: `识别这张照片中的食物种类和估算分量，并给出其营养成分（热量kcal, 蛋白质g, 碳水g, 脂肪g）。以 JSON 格式输出。` },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          dishName: { type: Type.STRING },
          nutrition: {
            type: Type.OBJECT,
            properties: {
              calories: { type: Type.NUMBER },
              protein: { type: Type.NUMBER },
              carbs: { type: Type.NUMBER },
              fat: { type: Type.NUMBER }
            }
          }
        }
      }
    }
  });
  return JSON.parse(response.text.trim());
};

export const analyzeNutrition = async (dishName: string): Promise<Nutrition> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `分析 "${dishName}" 的标准分量营养成分（kcal, protein, carbs, fat）。以 JSON 格式输出。`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          calories: { type: Type.NUMBER },
          protein: { type: Type.NUMBER },
          carbs: { type: Type.NUMBER },
          fat: { type: Type.NUMBER }
        }
      }
    }
  });
  return JSON.parse(response.text.trim());
};

export const analyzeHistory = async (history: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `根据记录：${history}，分析饮食习惯并提供健康建议。请简洁地用中文回复。`,
  });
  return response.text;
};

export const getDailySummary = async (dayRecords: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `这是我今天的饮食记录：${dayRecords}。请根据三餐摄入量给我一个简短的今日总结（50字以内），包括是否健康以及明天改进建议。`,
  });
  return response.text;
};
