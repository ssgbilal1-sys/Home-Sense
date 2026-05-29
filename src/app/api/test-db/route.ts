import { NextResponse } from 'next/server'

export async function GET() {
  const results: Record<string, string> = {}
  const password = '%40HomeSense%4010'
  const projectRef = 'gfvggrjplvzhrenixdfr'
  
  const regions = [
    'ap-south-1', 'ap-southeast-1', 'ap-northeast-1', 'ap-northeast-2',
    'us-east-1', 'us-west-1', 'us-east-2', 'us-west-2',
    'eu-west-1', 'eu-west-2', 'eu-central-1', 'eu-central-2',
    'sa-east-1', 'ca-central-1'
  ]
  
  for (const region of regions) {
    try {
      // Test via TCP connection using fetch to the pooler
      const url = `https://aws-0-${region}.pooler.supabase.com`
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 5000)
      
      try {
        const res = await fetch(url, { signal: controller.signal })
        clearTimeout(timeout)
        results[region] = `HTTP ${res.status}`
      } catch(e: any) {
        clearTimeout(timeout)
        results[region] = `FETCH ERROR: ${e.message?.substring(0, 50)}`
      }
    } catch(e: any) {
      results[region] = `ERROR: ${e.message?.substring(0, 50)}`
    }
  }
  
  return NextResponse.json(results)
}
