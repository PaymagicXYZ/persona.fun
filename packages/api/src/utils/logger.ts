export const logger = {
  info: (message: string, data?: any) => {
    const timestamp = new Date().toISOString()
    console.log(`\n[${timestamp}] ℹ️ ${message}`)
    if (data) console.log(JSON.stringify(data, null, 2))
  },
  
  error: (message: string, error?: any) => {
    const timestamp = new Date().toISOString()
    console.error(`\n[${timestamp}] ❌ ${message}`)
    if (error) console.error(JSON.stringify(error, null, 2))
  },
  
  warn: (message: string, data?: any) => {
    const timestamp = new Date().toISOString()
    console.warn(`\n[${timestamp}] ⚠️ ${message}`)
    if (data) console.warn(JSON.stringify(data, null, 2))
  },
  
  success: (message: string, data?: any) => {
    const timestamp = new Date().toISOString()
    console.log(`\n[${timestamp}] ✅ ${message}`)
    if (data) console.log(JSON.stringify(data, null, 2))
  }
} 