export default function EstimateForm() {
  return (
    <section className="bg-white px-5 py-16 text-black">
      <div className="mx-auto max-w-3xl rounded-3xl border border-black/10 bg-neutral-50 p-6 shadow-xl md:p-10">
        <p className="font-semibold text-yellow-600">Free estimate</p>

        <h2 className="mt-2 text-3xl font-extrabold md:text-5xl">
          Request a Handyman Estimate
        </h2>

        <p className="mt-4 text-black/65">
          Send your contact details, project description, and photos. We’ll get back to you as soon as possible.
        </p>

        <form
  action="/api/estimate"
  method="POST"
  encType="multipart/form-data"
  className="mt-8 space-y-5"
>

  <div>
    <label className="mb-2 block font-semibold">Full Name</label>
    <input
      type="text"
      name="name"
      required
      className="w-full rounded-xl border border-black/15 px-4 py-3"
      placeholder="Your name"
    />
  </div>

  <div>
    <label className="mb-2 block font-semibold">Phone Number</label>
    <input
      type="tel"
      name="phone"
      required
      className="w-full rounded-xl border border-black/15 px-4 py-3"
      placeholder="(813) 000-0000"
    />
  </div>

  <div>
    <label className="mb-2 block font-semibold">Email</label>
    <input
      type="email"
      name="email"
      className="w-full rounded-xl border border-black/15 px-4 py-3"
      placeholder="your@email.com"
    />
  </div>

  <div>
    <label className="mb-2 block font-semibold">Project Location</label>
    <input
      type="text"
      name="location"
      className="w-full rounded-xl border border-black/15 px-4 py-3"
      placeholder="City / ZIP code"
    />
  </div>

  <div>
    <label className="mb-2 block font-semibold">Project Description</label>
    <textarea
      name="message"
      required
      rows={5}
      className="w-full rounded-xl border border-black/15 px-4 py-3"
      placeholder="Please describe what needs to be done..."
    />
  </div>

  <div>
    <label className="mb-2 block font-semibold">Upload Photos</label>
    <input
      type="file"
      name="attachment"
      multiple
      accept="image/*"
      className="w-full rounded-xl border border-black/15 bg-white px-4 py-3"
    />
  </div>

  <button
    type="submit"
    className="w-full rounded-xl bg-black px-6 py-4 text-lg font-bold text-white"
  >
    Send Estimate Request
  </button>
</form>
      </div>
    </section>
  );
}