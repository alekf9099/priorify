export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { summary } = req.body;
  console.log('summary:', summary);
  
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  console.log('API KEY exists:', !!GEMINI_API_KEY);

  if (!summary) {
    return res.status(400).json({ error: 'No summary provided' });
  }

  try {
    // 1. 모델명을 최신 안정화 버전인 gemini-2.5-flash 로 변경했습니다.
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `다음은 내가 완료한 할 일 목록이에요. 친근하고 따뜻하게 분석해주세요:\n${summary}\n\n다음 형식으로 답해주세요:\n1. 칭찬 한마디 (1-2문장)\n2. 어떤 분야 일을 많이 완료했는지\n3. 생산성 패턴 분석\n4. 다음 목표 제안\n\n정원사가 식물을 돌보듯 따뜻하고 자연스러운 톤으로 답해주세요. 이모지 적절히 사용해주세요.`
          }]
        }]
      })
    });

    const data = await response.json();
    console.log('Gemini full response:', JSON.stringify(data));

    // 2. 에러 응답(400, 404, 500 등)이 왔을 때를 위한 안전장치 추가
    if (data.error) {
      console.error('Gemini API Error:', data.error);
      return res.status(response.status).json({ error: 'AI API 오류', detail: data.error.message });
    }

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts) {
      return res.status(500).json({ error: 'AI 응답 구조 오류', detail: JSON.stringify(data) });
    }

    const result = data.candidates[0].content.parts[0].text;
    res.status(200).json({ result });

  } catch(err) {
    console.error('Catch Error:', err.message);
    res.status(500).json({ error: '분석 중 오류가 발생했어요.', message: err.message });
  }
}
