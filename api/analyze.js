export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { summary } = req.body;
  
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!summary) {
    return res.status(400).json({ error: 'No summary provided' });
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `당신은 일정 관리 앱의 다정한 정원사 AI 피드백 봇입니다. 사용자가 제출한 '완료된 할 일 목록 및 일정 데이터'를 바탕으로 정원사가 식물을 돌보듯 따뜻하고 자연스러운 톤으로 분석 결과표를 만들어주세요. 적절한 이모지를 섞어 다음 4가지 항목으로 답해주세요.

[사용자의 완료 데이터]:
${summary}

[답변 형식]:
1. 🌱 칭찬 한마디
- 사용자의 노력과 완료 성과에 대해 다정하고 따뜻하게 격려하는 1~2문장을 작성해주세요.

2. 📋 완료 목록 요약 및 일정 피드백
- 사용자가 여태 어떤 일들을 수행해왔는지 핵심을 요약하고, 주어진 일정 내에 얼마나 성실하고 효율적으로 잘 완료했는지(일정 준수와 생산성 측면) 칭찬과 분석을 곁들여 성과를 짚어주세요.

3. 🔍 주요 완료 업무 성향
- 완료된 태스크들을 분석하여 사용자가 주로 '어떤 분야나 성격의 업무(예: 자기개발, 업무, 일상, 협업 등)'를 집중적으로 처리했는지 직관적으로 알려주세요.

4. 🎯 다음 목표 제안
- 현재까지의 완료 패턴과 속도를 바탕으로, 사용자가 지치지 않고 정원을 가꾸듯 이어서 실천하면 좋을 다음 단계나 새로운 목표를 다정하게 제안해주세요.`
          }]
        }]
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error('Gemini API Error:', data.error);
      return res.status(response.status).json({ error: 'AI API 오류', detail: data.error.message });
    }

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts) {
      return res.status(500).json({ error: 'AI 응답 구조 오류' });
    }

    const result = data.candidates[0].content.parts[0].text;
    res.status(200).json({ result });

  } catch(err) {
    console.error('Catch Error:', err.message);
    res.status(500).json({ error: '분석 중 오류가 발생했어요.' });
  }
}
