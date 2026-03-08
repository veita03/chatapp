import sys

with open('src/app/teams/create/page.tsx', 'r') as f:
    lines = f.readlines()

new_content = """      <div className="max-w-5xl mx-auto w-full px-4 sm:px-8 mt-8 pb-12">
        <div className="ui-card p-6 md:p-10 flex flex-col">
          <div className="flex items-center space-x-3 mb-8 pb-4 border-b border-gray-100">
             <h2 className="text-[22px] font-bold text-[#353b41]" style={{fontFamily: 'var(--font-montserrat)'}}>Dodaj novo ekipo in sezono</h2>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mb-8">
              
              {/* Left Column Data */}
              <div className="space-y-6">
                 
                 <div className="flex flex-col">
                    <div className="flex justify-between items-center mb-1.5">
                       <label className="ui-label m-0">Ime ekipe <span className="text-[#d29729]">*</span></label>
                       <InfoTooltip text="Ime ekipe lahko kadarkoli spremeniš/dopolniš" />
                    </div>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      placeholder="npr. Nogometna ekipa"
                      className="ui-input bg-white text-sm py-2.5 px-3"
                    />
                 </div>

                 <div className="flex flex-col">
                    <div className="flex justify-between items-center mb-1.5">
                       <label className="ui-label m-0">Ime sezone <span className="text-[#d29729]">*</span></label>
                       <InfoTooltip text="Ime sezone se uporablja za ločevanje statistike in zgodovinskega pregleda (npr. 'Jesen 2025' ali 'Liga I. faza', torkov termin). Trajanje in ime sezone lahko kadarkoli prilagodite." />
                    </div>
                    <input
                      type="text"
                      required
                      value={formData.seasonName}
                      onChange={e => setFormData({...formData, seasonName: e.target.value})}
                      placeholder="npr. 2025/2026 / Poletna liga 2026 / Torkov termin"
                      className="ui-input bg-white text-sm py-2.5 px-3"
                    />
                 </div>

                 <div className="flex flex-col">
                    <div className="flex justify-between items-center mb-2.5">
                       <label className="ui-label m-0">Izberi šport iz seznama <span className="text-[#d29729]">*</span></label>
                       <InfoTooltip text="Izbereš lahko samo en šport, ker sta točkovanje in statistika prilagojena dotičnemu športu." />
                    </div>
                    <div className="ui-input bg-white py-4 px-3 flex flex-wrap justify-center gap-2.5">
                       {SPORTS.map((sport, idx) => (
                         <button
                           key={sport.name}
                           type="button"
                           onClick={() => setFormData({...formData, sport: sport.name})}
                           className={`px-4 py-2 rounded-md border transition-all text-sm font-medium ${
                             formData.sport === sport.name 
                               ? 'border-[#eeb054] text-[#dba032] shadow-[0_0_0_1px_rgba(238,176,84,0.3)] bg-[#fdfaf1]' 
                               : 'border-[#f3ebcd] text-gray-500 hover:border-[#eeb054]/50 hover:text-gray-700 hover:bg-gray-50 bg-white'
                           }`}
                         >
                           {sport.name}
                         </button>
                       ))}
                    </div>
                 </div>

              </div>

              {/* Right Column Image */}
              <div className="flex flex-col">
                 <div className="flex justify-between items-center mb-1.5">
                    <label className="ui-label m-0">Slika ekipe</label>
                    <InfoTooltip text="Po želji lahko dodaš tudi fotografijo ekipe, pri čemer je zaželeno razmerje 4:3. Fotografijo je seveda mogoče dodati tudi kasneje." />
                 </div>
                 
                 <label className={`block w-full flex-1 min-h-[220px] bg-white border-2 border-dashed rounded-xl overflow-hidden cursor-pointer hover:bg-gray-50 transition-colors flex flex-col items-center justify-center relative group ${formData.image ? 'border-[#eeb054]/30' : 'border-[#f3ebcd] hover:border-[#eeb054]/50'}`}>
                    {formData.image ? (
                      <>
                        <img src={formData.image} alt="Preview" className="w-full h-full object-cover absolute inset-0" />
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[#dba032] text-sm font-bold">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-8 h-8 mb-2"><path d="M2.695 14.763l-1.262 3.152a.5.5 0 00.65.65l3.151-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" /></svg>
                          Spremeni sliko
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center p-6 h-full w-full">
                        <svg className="w-12 h-12 text-[#eeb054]/80 mb-3" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                        </svg>
                        <p className="text-gray-500 text-sm font-medium">Spusti sliko sem ali klikni za izbor</p>
                      </div>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                 </label>
              </div>

            </div>

            {/* Description Area */}
            <div className="flex flex-col mb-10">
               <label className="ui-label mb-1.5">Opis ekipe</label>
               <textarea
                 value={formData.desc}
                 onChange={e => setFormData({...formData, desc: e.target.value})}
                 placeholder="npr. Dvakrat tedensko termin malega nogometa"
                 className="ui-input bg-white min-h-[100px] resize-y text-sm py-3 px-3 w-full"
               />
            </div>

            {/* Invite Placeholder */}
            <div className="flex flex-col pt-6 border-t border-gray-100 mb-8">
               <div className="flex justify-between items-center mb-4">
                  <label className="ui-label block m-0">Dodaj igralce v ekipo in sezono (opcijsko)</label>
                  <InfoTooltip text="Člane lahko dodaš takoj po ustvaritvi ekipe preko unikatne povezave, elektronske pošte ali pa jih vneseš ročno (za člane brez digitalnega dostopa)." />
               </div>
               
               <div className="bg-[#fcfaf5] border border-[#f3ebcd] rounded-xl p-8 text-center relative overflow-hidden">
                  <div className="relative z-10 flex flex-col items-center justify-center">
                    <h4 className="text-[#eeb054] font-bold text-[15px] mb-2">Povabi člane preko unikatne povezave</h4>
                    <p className="text-gray-500 text-sm max-w-sm mx-auto mb-4">
                      Ko boste shranili novo ekipo, boste preusmerjeni na nadzorno ploščo, kjer boste povezavo lahko kopirali.
                    </p>
                    <div className="flex items-center space-x-2 border opacity-60 border-[#eeb054]/30 bg-white rounded-lg p-2 px-3 max-w-[260px] mx-auto select-none">
                      <div className="flex-1 font-bold text-[#eeb054] tracking-widest text-lg">POVEZAVA</div>
                      <div className="bg-[#6db592] text-white p-2.5 rounded-md">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z" /><path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.439A1.5 1.5 0 008.378 6H4.5z" /></svg>
                      </div>
                    </div>
                  </div>
               </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end space-x-4 border-t border-gray-100 pt-6">
               <button 
                 type="button" 
                 onClick={() => router.push('/teams')}
                 className="px-6 py-2.5 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-bold transition-all shadow-sm"
               >
                 Prekliči
               </button>
               <button 
                 onClick={handleSubmit}
                 disabled={isSubmitting}
                 className="bg-[#6db592] hover:bg-[#5b9e7e] text-white disabled:opacity-70 font-bold text-sm px-8 py-2.5 rounded-lg transition-colors shadow-sm flex items-center space-x-2"
               >
                 {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                 ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                 )}
                 <span>Ustvari ekipo</span>
               </button>
            </div>
          </form>
        </div>
      </div>
"""

# Replace lines 107 to 274 inclusive (0-indexed: 106:274)
lines = lines[:106] + [new_content] + lines[274:]

with open('src/app/teams/create/page.tsx', 'w') as f:
    f.writelines(lines)

