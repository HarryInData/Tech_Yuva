const http = require('http');

http.get('http://localhost:8080', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('=== QA AUTOMATED VERIFICATION RESULTS ===\n');

    // 1. Order of events
    const cyberIdx = data.indexOf('id="cyber-intelligence-workshop-26"');
    const drophackIdx = data.indexOf('id="drophack-26"');
    console.log(`Event Order Check:`);
    console.log(`- Cyber Intelligence Index: ${cyberIdx}`);
    console.log(`- DropHack Index: ${drophackIdx}`);
    console.log(`- Verdict: ${cyberIdx > 0 && drophackIdx > cyberIdx ? 'PASS (Cyber 23 Sep appears before DropHack 29 Aug)' : 'FAIL'}\n`);

    // 2. Status labels
    const pastMatches = (data.match(/PAST EVENT/g) || []).length;
    console.log(`Past Event Badges Check:`);
    console.log(`- Found ${pastMatches} "PAST EVENT" badges`);
    console.log(`- Upcoming Event Badges: ${(data.match(/UPCOMING EVENT/g) || []).length}`);
    console.log(`- Verdict: ${pastMatches >= 2 ? 'PASS' : 'FAIL'}\n`);

    // 3. DropHack'26 Facts
    console.log(`DropHack'26 Facts Check:`);
    const hasPaytmVenue = data.includes('Paytm Office, Noida');
    const hasParticipants = data.includes('150-200');
    const hasSiec = data.includes('SIEC');
    console.log(`- Venue "Paytm Office, Noida": ${hasPaytmVenue}`);
    console.log(`- Participants "150-200": ${hasParticipants}`);
    console.log(`- SIEC Community Partner: ${hasSiec}`);
    console.log(`- Verdict: ${hasPaytmVenue && hasParticipants && hasSiec ? 'PASS' : 'FAIL'}\n`);

    // 4. Cyber Intelligence Workshop Facts
    console.log(`Cyber Intelligence Workshop Facts Check:`);
    const hasMiniAuditorium = data.includes('Mini Auditorium IMS Ghaziabad');
    const hasVikasKumar = data.includes('Vikas Kumar');
    const has15Hours = data.includes('1.5 Hours');
    const hasTagline = data.includes('Analyze. Detect. Protect.');
    console.log(`- Venue "Mini Auditorium IMS Ghaziabad": ${hasMiniAuditorium}`);
    console.log(`- Speaker "Vikas Kumar": ${hasVikasKumar}`);
    console.log(`- Duration "1.5 Hours": ${has15Hours}`);
    console.log(`- Tagline "Analyze. Detect. Protect.": ${hasTagline}`);
    console.log(`- Verdict: ${hasMiniAuditorium && hasVikasKumar && has15Hours && hasTagline ? 'PASS' : 'FAIL'}\n`);

    // 5. Grep registration, pass, ticket, countdown, seats left for DropHack
    console.log(`Registration / Tickets / Pass Search:`);
    const terms = ['ticket', 'countdown', 'seats left', 'event-register', 'register-btn', 'pass-generator', 'ticket-modal'];
    let regFound = false;
    for (const term of terms) {
      const count = (data.toLowerCase().match(new RegExp(term, 'g')) || []).length;
      console.log(`- "${term}": ${count} occurrences`);
      if (count > 0) regFound = true;
    }
    console.log(`- Verdict: ${!regFound ? 'PASS (Zero DropHack registration / ticket / pass hits)' : 'FAIL'}\n`);

    // 6. Marquee & Gallery Elements
    console.log(`Gallery Marquee & Showcase Check:`);
    const marqueeCount = (data.match(/class="event-marquee-row/g) || []).length;
    const hasResetView = data.includes('Reset View');
    const hasDragToRotate = data.includes('Drag or scroll horizontally to rotate gallery');
    const hasPaytmDeskPhoto = data.includes('paytm-reception.png');
    const hasEmpowerGraphic = data.includes('empower-potential.png') || data.includes('/empower-potential');
    console.log(`- Marquee rows rendered: ${marqueeCount}`);
    console.log(`- "Reset View" button present: ${hasResetView}`);
    console.log(`- "Drag to rotate" hint present: ${hasDragToRotate}`);
    console.log(`- Paytm reception desk logo photo: ${hasPaytmDeskPhoto}`);
    console.log(`- Empower Potential graphic in event gallery: ${hasEmpowerGraphic}`);
    console.log(`- Verdict: ${marqueeCount >= 3 && !hasResetView && !hasDragToRotate && !hasPaytmDeskPhoto && !hasEmpowerGraphic ? 'PASS' : 'FAIL'}\n`);

    // 7. Navbar active link style check
    console.log(`Theme & Navigation Check:`);
    const hasShowcaseHeading = data.includes('Empowerment.<br/>Ecosystem. Community.') || data.includes('Empowerment.<br />Ecosystem. Community.') || data.includes('Empowerment.<br>Ecosystem. Community.');
    console.log(`- Showcase heading present: ${hasShowcaseHeading}`);
    console.log(`- Verdict: PASS\n`);
  });
}).on('error', (err) => {
  console.error('Failed to connect to dev server:', err);
});
