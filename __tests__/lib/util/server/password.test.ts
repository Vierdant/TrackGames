import { hashPassword, verifyPassword } from "@/lib/util/server/password";

describe("password hashing", () => {
	it("produces a hash containing the configured version and a salt", async () => {
		const hash = await hashPassword("correct horse battery staple");
		const [version, salt, key] = hash.split(":");

		expect(version).toBe(process.env.PASSWORD_VERSION);
		expect(salt).toHaveLength(32);
		expect(key.length).toBeGreaterThan(0);
	});

	it("verifies a matching password", async () => {
		const hash = await hashPassword("correct horse battery staple");
		await expect(verifyPassword("correct horse battery staple", hash)).resolves.toBe(true);
	});

	it("rejects a wrong password", async () => {
		const hash = await hashPassword("correct horse battery staple");
		await expect(verifyPassword("wrong password", hash)).resolves.toBe(false);
	});

	it("produces a different hash and salt each time (no rainbow tables)", async () => {
		const first = await hashPassword("same password");
		const second = await hashPassword("same password");

		expect(first).not.toBe(second);
	});

	it("rejects a hash with an unknown version", async () => {
		await expect(verifyPassword("anything", "unknown-version:deadbeef:deadbeef")).resolves.toBe(false);
	});

	it("rejects a malformed hash", async () => {
		await expect(verifyPassword("anything", "not-a-valid-hash")).resolves.toBe(false);
	});
});
