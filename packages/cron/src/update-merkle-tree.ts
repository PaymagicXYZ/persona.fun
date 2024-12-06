import { updateMerkleTree } from "./index"

const main = async () => {
  try {
    await updateMerkleTree()
  } catch (error) {
    console.error("Error in main process:", error)
    process.exit(1)
  }
}

main()
  .then(() => {
    console.log("Job completed")
    process.exit(0)
  })
  .catch((error) => {
    console.error("Fatal error:", error)
    process.exit(1)
  })
