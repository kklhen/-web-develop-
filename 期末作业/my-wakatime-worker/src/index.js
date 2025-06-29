export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // 允许所有来源的 CORS 请求 (在生产环境中您可能希望更严格) 
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
    
    // 处理 OPTIONS 预检请求 
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    // 如果请求路径是 /api，返回 Wakatime 数据
    if (url.pathname === '/api') {
      // 从环境变量中获取 Wakatime API Key 
      const WAKATIME_API_KEY = env.WAKATIME_API_KEY;
      if (!WAKATIME_API_KEY) {
        return new Response(
          JSON.stringify({ error: 'Wakatime API key not configured in Worker environment' }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    // Wakatime API URL 
    // 您可以根据需要调整 range 参数, e.g., last_7_days, last_30_days, last_6_months, last_year 
    const wakatimeUrl = `https://wakatime.com/api/v1/users/current/all_time_since_today?api_key=${WAKATIME_API_KEY}`;
      try {
        const response = await fetch(wakatimeUrl);
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Wakatime API error: ${response.status} ${errorText}`);
          return new Response(
            JSON.stringify({ error: 'Failed to fetch data from Wakatime API', details: errorText }),
            {
              status: response.status,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }
        const data = await response.json();
        // 返回 Wakatime 数据 
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (error) {
        console.error('Error fetching Wakatime data:', error);
        return new Response(
          JSON.stringify({ error: 'Internal server error in Worker', details: error.message }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }
    
    // 对于其他路径，返回静态资源或默认响应
    return env.ASSETS.fetch(request);
  },
};
