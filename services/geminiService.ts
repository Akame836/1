
import { GoogleGenAI, Type } from "@google/genai";
import { Dish, Nutrition, OrderRecord, MealType } from "../types";

// Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
// Create a new GoogleGenAI instance right before making an API call to ensure it always uses the most up-to-date API key.
const getAI = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

/**
 * 识别菜单图片
 */
export const parseMenuImage = async (base64Image: string): Promise<{ storeName: string; dishes: Partial<Dish>[] }> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
        { 
          text: `你是一个外卖菜单分析专家。请识别图片中的店铺名称和所有菜品（包含单价）。
          注意：
          1. 价格通常在菜名旁边。
          2. 如果有配送时间，也请提取。
          3. 输出必须是合法的 JSON。` 
        },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          storeName: { type: Type.STRING, description: "店铺名称" },
          dishes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: "菜名" },
                price: { type: Type.NUMBER, description: "单价或实付价" },
                deliveryTimeMinutes: { type: Type.NUMBER, description: "预计配送时间" },
                category: { type: Type.STRING, description: "分类，如热销、主食、饮料" }
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

/**
 * 识别订单截图并分析消费记录
 */
export const parseOrderScreenshot = async (base64Image: string): Promise<Partial<OrderRecord>[]> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
        { 
          text: `你是一个外卖订单分析专家。请识别这张订单截图中的店铺名称和所有菜品名称及其实付价格。
          同时请根据菜名估算每个菜品的营养成分（热量、蛋白质、碳水、脂肪）。
          输出格式为 JSON 数组。` 
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
            dishName: { type: Type.STRING, description: "菜名" },
            storeName: { type: Type.STRING, description: "店铺名称" },
            price: { type: Type.NUMBER, description: "实付金额" },
            nutrition: {
              type: Type.OBJECT,
              properties: {
                calories: { type: Type.NUMBER, description: "卡路里 (kcal)" },
                protein: { type: Type.NUMBER, description: "蛋白质 (g)" },
                carbs: { type: Type.NUMBER, description: "碳水 (g)" },
                fat: { type: Type.NUMBER, description: "脂肪 (g)" }
              },
              required: ["calories", "protein", "carbs", "fat"]
            }
          },
          required: ["dishName", "storeName", "price", "nutrition"]
        }
      }
    }
  });
  
  return JSON.parse(response.text.trim());
};

/**
 * 分析当餐实物并记录
 */
export const analyzeFoodImage = async (base64Image: string): Promise<{ dishName: string; nutrition: Nutrition }> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
        { text: `识别这张照片中的食物，估算其营养成分。请给出准确的菜名。` },
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
              calories: { type: Type.NUMBER, description: "卡路里 (kcal)" },
              protein: { type: Type.NUMBER, description: "蛋白质 (g)" },
              carbs: { type: Type.NUMBER, description: "碳水 (g)" },
              fat: { type: Type.NUMBER, description: "脂肪 (g)" }
            },
            required: ["calories", "protein", "carbs", "fat"]
          }
        },
        required: ["dishName", "nutrition"]
      }
    }
  });
  return JSON.parse(response.text.trim());
};

/**
 * 纯文本营养分析（用于手动录入时辅助）
 */
export const analyzeNutrition = async (dishName: string): Promise<Nutrition> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `分析菜品 "${dishName}" 的平均营养成分。只需输出 JSON。`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            calories: { type: Type.NUMBER },
            protein: { type: Type.NUMBER },
            carbs: { type: Type.NUMBER },
            fat: { type: Type.NUMBER }
          },
          required: ["calories", "protein", "carbs", "fat"]
        }
      }
    });
    return JSON.parse(response.text.trim());
  } catch (e) {
    // 降级处理：如果没有有效 API Key 或网络错误，返回平均估算值
    return { calories: 450, protein: 15, carbs: 55, fat: 12 };
  }
};

/**
 * 获取每日饮食总结
 */
export const getDailySummary = async (dayRecords: string): Promise<string> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `以下是今日饮食记录：${dayRecords}。请以专业营养师的口吻给出一个 40 字以内的点评建议。`,
    });
    return response.text || "暂无建议";
  } catch (e) {
    return "本地记录已保存。配置 API 密钥后可获取 AI 营养分析总结。";
  }
};
