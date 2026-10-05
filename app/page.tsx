'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Home() {
  const [teamSearchQuery, setTeamSearchQuery] = useState<string>('');
  const [teams, setTeams] = useState<any[]>([]);

  const [isAdmin, setIsAdmin] = useState(false);
  const [passInput, setPassInput] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);

  const [showTeamForm, setShowTeamForm] = useState(false);
  const [teamTag, setTeamTag] = useState('');
  const [teamName, setTeamName] = useState('');
  const [teamLogoUrl, setTeamLogoUrl] = useState('');

  const [selectedTeam, setSelectedTeam] = useState<any | null>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [teamScores, setTeamScores] = useState<any[]>([]);
  const [playerScores, setPlayerScores] = useState<any[]>([]);

  const [selectedPlayerForHistory, setSelectedPlayerForHistory] = useState<any | null>(null);

  const [roomNameInput, setRoomNameInput] = useState('');
  const [killPtsInput, setKillPtsInput] = useState<number | ''>('');
  const [placePtsInput, setPlacePtsInput] = useState<number | ''>('');
  const [matchesInput, setMatchesInput] = useState<number>(5);

  const [newPlayerIgn, setNewPlayerIgn] = useState('');
  const [newPlayerRole, setNewPlayerRole] = useState('ATK 1');

  const [showPlayerScoreModal, setShowPlayerScoreModal] = useState(false);
  const [selectedRoomForScore, setSelectedRoomForScore] = useState<any | null>(null);
  const [selectedGameNo, setSelectedGameNo] = useState<number>(1);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [playerGameStats, setPlayerGameStats] = useState<{ [playerId: string]: { kills: number | ''; assists: number | ''; damage: number | '' } }>({});

  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  async function fetchAllData() {
    try {
      const { data: tData } = await supabase.from('teams').select('*').order('name', { ascending: true });
      const { data: pData } = await supabase.from('players').select('*');
      const { data: sData } = await supabase.from('team_scores').select('*');
      const { data: psData } = await supabase.from('player_game_scores').select('*');

      setTeams(tData || []);
      setPlayers(pData || []);
      setTeamScores(sData || []);
      setPlayerScores(psData || []);
    } catch (err) {
      console.error(err);
    }
  }

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passInput === 'coachway123') {
      setIsAdmin(true);
      setShowLoginModal(false);
      setPassInput('');
      alert('เข้าสู่ระบบแอดมินสำเร็จ');
    } else {
      alert('รหัสผ่านไม่ถูกต้อง');
    }
  };

  const requireAdmin = () => {
    if (!isAdmin) {
      setShowLoginModal(true);
      return false;
    }
    return true;
  };

  async function handleDirectImageUpload(e: React.ChangeEvent<HTMLInputElement>, setterFunc: (url: string) => void) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

    const { error } = await supabase.storage.from('esports-assets').upload(fileName, file);
    if (error) {
      alert('อัปโหลดรูปไม่สำเร็จ: ' + error.message);
      return;
    }

    const { data: pubData } = supabase.storage.from('esports-assets').getPublicUrl(fileName);
    if (pubData) {
      setterFunc(pubData.publicUrl);
      alert('อัปโหลดรูปสำเร็จ');
    }
  }

  async function handleAddTeam(e: React.FormEvent) {
    e.preventDefault();
    if (!requireAdmin()) return;
    if (!teamName.trim() || !teamTag.trim()) return;
    
    const { error } = await supabase.from('teams').insert([{ 
      name: teamName.trim(), 
      tag: teamTag.trim().toUpperCase(),
      logo_url: teamLogoUrl.trim() || null 
    }]);

    if (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message);
      return;
    }

    setTeamName(''); setTeamTag(''); setTeamLogoUrl(''); setShowTeamForm(false);
    fetchAllData();
  }

  async function handleDeleteTeam(teamId: string, teamName: string) {
    if (!requireAdmin()) return;
    if (!confirm(`ต้องการลบ Team "${teamName}" ใช่หรือไม่`)) return;
    
    await supabase.from('teams').delete().eq('id', teamId);
    if (selectedTeam?.id === teamId) setSelectedTeam(null);
    fetchAllData();
  }

  async function handleAddTeamScore(teamId: string) {
    if (!requireAdmin()) return;
    if (!roomNameInput.trim()) return alert('กรุณากรอกชื่อห้อง');

    const kPts = Number(killPtsInput) || 0;
    const pPts = Number(placePtsInput) || 0;
    const matches = Number(matchesInput) || 1;

    const { error } = await supabase.from('team_scores').insert([{
      team_id: teamId,
      room_name: roomNameInput.trim(),
      kill_points: kPts,
      placement_points: pPts,
      matches: matches
    }]);

    if (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message);
      return;
    }

    setRoomNameInput('');
    setKillPtsInput('');
    setPlacePtsInput('');
    setMatchesInput(5);
    alert('บันทึกคะแนนทีมสำเร็จ');
    fetchAllData();
  }

  async function handleDeleteTeamScore(scoreId: string) {
    if (!requireAdmin()) return;
    if (!confirm('ต้องการลบประวัติคะแนนนี้ใช่หรือไม่?')) return;

    await supabase.from('team_scores').delete().eq('id', scoreId);
    await supabase.from('player_game_scores').delete().eq('team_score_id', scoreId);
    fetchAllData();
  }

  async function handleAddPlayerToTeam(teamId: string) {
    if (!requireAdmin()) return;
    if (!newPlayerIgn.trim()) return alert('กรุณากรอกชื่อ IGN ผู้เล่น');

    const { error } = await supabase.from('players').insert([{
      team_id: teamId,
      ign: newPlayerIgn.trim(),
      role: newPlayerRole,
      is_resting: false
    }]);

    if (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message);
      return;
    }

    setNewPlayerIgn('');
    alert('เพิ่มผู้เล่นสำเร็จ');
    fetchAllData();
  }

  async function handleDeletePlayer(playerId: string) {
    if (!requireAdmin()) return;
    if (!confirm('ต้องการลบผู้เล่นนี้ออกจากทีมใช่หรือไม่?')) return;

    await supabase.from('players').delete().eq('id', playerId);
    fetchAllData();
  }

  async function handleTogglePlayerRest(playerId: string, currentStatus: boolean) {
    if (!requireAdmin()) return;

    const { error } = await supabase.from('players')
      .update({ is_resting: !currentStatus })
      .eq('id', playerId);

    if (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message);
      return;
    }
    fetchAllData();
  }

  function openPlayerScoreModal(room: any) {
    if (!requireAdmin()) return;
    setSelectedRoomForScore(room);
    setSelectedGameNo(1);
    setSelectedPlayerIds([]);
    setPlayerGameStats({});
    setShowPlayerScoreModal(true);
  }

  function handleTogglePlayerSelection(playerId: string) {
    if (selectedPlayerIds.includes(playerId)) {
      setSelectedPlayerIds(selectedPlayerIds.filter(id => id !== playerId));
    } else {
      if (selectedPlayerIds.length >= 4) {
        return alert('สามารถเลือกผู้เล่นลงแข่งได้สูงสุด 4 คนต่อเกมครับ');
      }
      setSelectedPlayerIds([...selectedPlayerIds, playerId]);
    }
  }

  async function handleSavePlayerGameScores() {
    if (!requireAdmin()) return;
    if (!selectedRoomForScore) return;
    if (selectedPlayerIds.length === 0) return alert('กรุณาเลือกผู้เล่นอย่างน้อย 1 คน');

    try {
      await supabase.from('player_game_scores')
        .delete()
        .eq('team_score_id', selectedRoomForScore.id)
        .eq('game_no', selectedGameNo);

      const recordsToInsert = selectedPlayerIds.map(pId => {
        const stats = playerGameStats[pId] || { kills: '', assists: '', damage: '' };
        return {
          team_score_id: selectedRoomForScore.id,
          game_no: selectedGameNo,
          player_id: pId,
          kills: Number(stats.kills) || 0,
          assists: Number(stats.assists) || 0,
          damage: Number(stats.damage) || 0
        };
      });

      const { error } = await supabase.from('player_game_scores').insert(recordsToInsert);
      if (error) throw error;

      alert(`บันทึกคะแนนผู้เล่น เกมที่ ${selectedGameNo} สำเร็จ`);
      setShowPlayerScoreModal(false);
      fetchAllData();
    } catch (err: any) {
      alert('เกิดข้อผิดพลาด: ' + err.message);
    }
  }

  const teamsWithDetails = teams.map(t => {
    const tScores = teamScores.filter(s => String(s.team_id) === String(t.id));
    
    const rolePriority: { [key: string]: number } = {
      'IGL': 1,
      'Co-iGL': 2,
      'ATK 1': 3,
      'ATK 2': 4,
      'Scout': 5,
      'Flex': 6
    };

    const allTeamPlayers = players.filter(p => String(p.team_id) === String(t.id)).map(p => {
      const pGameRecords = playerScores.filter(ps => String(ps.player_id) === String(p.id));
      const totalKills = pGameRecords.reduce((sum, r) => sum + (r.kills || 0), 0);
      const totalAssists = pGameRecords.reduce((sum, r) => sum + (r.assists || 0), 0);
      const totalDamage = pGameRecords.reduce((sum, r) => sum + (r.damage || 0), 0);
      const matchesPlayed = pGameRecords.length;
      const kda = matchesPlayed > 0 ? ((totalKills + totalAssists) / matchesPlayed).toFixed(2) : '0.00';

      return { 
        ...p, 
        totalKills, 
        totalAssists, 
        totalDamage, 
        matchesPlayed,
        kda,
        gameRecords: pGameRecords 
      };
    }).sort((a, b) => {
      const pA = rolePriority[a.role] || 99;
      const pB = rolePriority[b.role] || 99;
      if (pA !== pB) return pA - pB;
      return a.ign.localeCompare(b.ign);
    });

    const displayPlayers = isAdmin 
      ? allTeamPlayers 
      : allTeamPlayers.filter(p => !p.is_resting);

    const totalKillPts = tScores.reduce((sum, s) => sum + (s.kill_points || 0), 0);
    const totalPlacePts = tScores.reduce((sum, s) => sum + (s.placement_points || 0), 0);
    const totalPts = totalKillPts + totalPlacePts;
    const totalMatches = tScores.reduce((sum, s) => sum + (Number(s.matches) || 5), 0);
    const avgPts = totalMatches > 0 ? (totalPts / totalMatches).toFixed(2) : '0.00';

    return {
      ...t,
      scores: tScores,
      roster: displayPlayers,
      allRoster: allTeamPlayers,
      totalPts,
      totalKillPts,
      totalPlacePts,
      totalMatches,
      avgPts
    };
  });

  const filteredTeams = teamsWithDetails.filter(t => {
    if (!teamSearchQuery.trim()) return true;
    return t.name.toLowerCase().includes(teamSearchQuery.toLowerCase().trim()) || t.tag.toLowerCase().includes(teamSearchQuery.toLowerCase().trim());
  });

  const rankedTeams = [...filteredTeams].sort((a, b) => b.totalPts - a.totalPts);
  const activeSelectedTeam = selectedTeam ? teamsWithDetails.find(t => String(t.id) === String(selectedTeam.id)) : null;

  return (
    <div className="min-h-screen bg-black text-slate-100 font-sans p-4 max-w-md mx-auto border-x border-zinc-900 shadow-2xl relative">
      <header className="py-3 border-b border-zinc-800 mb-4 flex justify-between items-center">
        <div>
          <div className="flex items-baseline gap-2">
            <h1 className="text-sm font-black text-sky-400 tracking-wider">iSOTOPE ESPORTS</h1>
            <span className="text-[10px] text-pink-300">| Sponsor By <span className="text-pink-300 font-bold">CONYSWEET</span></span>
          </div>
        </div>
        <div>
          {isAdmin ? (
            <button
              onClick={() => {
                setIsAdmin(false);
                alert('ออกจากระบบแอดมินแล้ว');
              }}
              className="bg-emerald-500/25 hover:bg-red-500/25 border border-emerald-500/40 hover:border-red-500/40 text-emerald-400 hover:text-red-400 text-[9px] px-2.5 py-1 rounded font-bold transition cursor-pointer"
            >
              แอดมิน (คลิกออก)
            </button>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="bg-zinc-900 hover:bg-zinc-800 text-sky-400 border border-sky-500/30 text-[9px] px-2.5 py-1 rounded font-bold transition cursor-pointer"
            >
              เข้าสู่ระบบแอดมิน
            </button>
          )}
        </div>
      </header>

      {showLoginModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl w-full max-w-xs space-y-4 shadow-2xl">
            <h2 className="text-sm font-bold text-sky-400">ยืนยันตัวตนผู้ดูแลระบบ</h2>
            <form onSubmit={handleAdminLogin} className="space-y-3">
              <input
                type="password"
                placeholder="รหัสผ่านแอดมิน"
                value={passInput}
                onChange={(e) => setPassInput(e.target.value)}
                className="w-full bg-black border border-zinc-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-sky-500"
                autoFocus
              />
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-sky-500 hover:bg-sky-400 text-black font-bold py-2 rounded-xl text-xs transition cursor-pointer">ยืนยัน</button>
                <button type="button" onClick={() => setShowLoginModal(false)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-2 rounded-xl text-xs transition cursor-pointer">ยกเลิก</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <main className="space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-xs font-bold text-zinc-300">รายชื่อทีมทั้งหมด ({teams.length} ทีม)</h2>
          {isAdmin && (
            <button onClick={() => setShowTeamForm(!showTeamForm)} className="text-xs bg-sky-500 text-black font-bold px-2.5 py-1 rounded cursor-pointer">
              {showTeamForm ? 'ปิดฟอร์ม' : '+ เพิ่ม Team'}
            </button>
          )}
        </div>

        {isAdmin && showTeamForm && (
          <form onSubmit={handleAddTeam} className="bg-zinc-900 p-3 rounded-xl border border-sky-500/30 space-y-2 text-xs">
            <input type="text" placeholder="TAG (เช่น ALGX)" value={teamTag} onChange={e => setTeamTag(e.target.value)} className="w-full bg-black p-2 rounded text-white uppercase border border-zinc-800" />
            <input type="text" placeholder="ชื่อ Team" value={teamName} onChange={e => setTeamName(e.target.value)} className="w-full bg-black p-2 rounded text-white border border-zinc-800" />
            
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400 block">โลโก้ทีม (ใส่ URL หรืออัปโหลดรูป)</label>
              <div className="flex gap-1">
                <input type="text" placeholder="https://... หรืออัปโหลดรูปขวา" value={teamLogoUrl} onChange={e => setTeamLogoUrl(e.target.value)} className="flex-1 bg-black p-2 rounded text-white border border-zinc-800 text-xs" />
                <label className="bg-zinc-800 hover:bg-zinc-700 text-sky-400 font-bold px-3 py-2 rounded text-xs cursor-pointer flex items-center justify-center border border-sky-500/30">
                  อัปโหลด
                  <input type="file" accept="image/*" onChange={(e) => handleDirectImageUpload(e, teamLogoUrl => setTeamLogoUrl(teamLogoUrl))} className="hidden" />
                </label>
              </div>
            </div>

            <button type="submit" className="w-full bg-sky-500 text-black font-bold py-1.5 rounded cursor-pointer">บันทึก Team</button>
          </form>
        )}

        <input
          type="text"
          placeholder="ค้นหาชื่อทีมหรือ TAG..."
          value={teamSearchQuery}
          onChange={(e) => setTeamSearchQuery(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500 transition"
        />

        <div className="space-y-3">
          {rankedTeams.length === 0 ? (
            <div className="bg-zinc-900/40 p-10 rounded-3xl border border-zinc-800 text-center text-xs text-zinc-400">ไม่พบข้อมูล Team</div>
          ) : (
            rankedTeams.map((t) => (
              <div 
                key={t.id} 
                onClick={() => setSelectedTeam(t)}
                className="p-3 rounded-2xl border-2 border-zinc-800 relative overflow-hidden shadow-xl bg-zinc-950 cursor-pointer hover:border-sky-500 transition group"
              >
                {t.logo_url && (
                  <div 
                    className="absolute inset-0 bg-no-repeat bg-right bg-cover opacity-25 pointer-events-none filter blur-[1px] scale-125" 
                    style={{ backgroundImage: `url(${t.logo_url})` }}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/70 to-black/40 pointer-events-none" />

                <div className="relative z-10 flex items-center justify-between py-1 gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {t.logo_url ? (
                      <img src={t.logo_url} alt={t.name} onClick={(e) => { e.stopPropagation(); setPreviewImage({ url: t.logo_url, title: `[${t.tag}] ${t.name}` }); }} className="w-12 h-12 object-contain rounded-xl bg-zinc-950/90 p-1.5 border border-zinc-700/80 shrink-0 cursor-pointer shadow-lg" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-[10px] text-zinc-500 shrink-0">ไม่มีโลโก้</div>
                    )}
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <span className="text-[9px] font-black bg-sky-500/30 text-sky-300 px-2 py-0.2 rounded border border-sky-500/50 inline-block">[{t.tag}]</span>
                      <h3 className="font-black text-sm text-white drop-shadow truncate group-hover:text-sky-400 transition">{t.name}</h3>
                      <div className="text-[10px] text-zinc-300 flex gap-2.5">
                        <span>คะแนนรวม: <strong className="text-sky-400">{t.totalPts}</strong></span>
                        <span>AVG: <strong className="text-emerald-400">{t.avgPts}</strong></span>
                        <span>ผู้เล่น: <strong className="text-white">{t.roster.length} คน</strong></span>
                      </div>
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="shrink-0">
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteTeam(t.id, t.name); }} className="text-[10px] bg-red-500/20 text-red-400 px-2.5 py-1.5 rounded-lg border border-red-500/30 hover:bg-red-500/30 shadow cursor-pointer">ลบ</button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* ================= MODAL: หน้าจัดการทีม ================= */}
      {activeSelectedTeam && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 p-4 text-xs">
          <div className="bg-zinc-900 border border-sky-500/40 w-full max-w-md rounded-2xl p-4 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-3">
                {activeSelectedTeam.logo_url && (
                  <img src={activeSelectedTeam.logo_url} alt={activeSelectedTeam.name} className="w-10 h-10 object-contain rounded-lg bg-zinc-950 p-1 border border-zinc-800" />
                )}
                <div>
                  <h3 className="font-black text-sky-400 text-sm">[{activeSelectedTeam.tag}] {activeSelectedTeam.name}</h3>
                  <p className="text-[10px] text-zinc-400">คะแนนรวม: <strong className="text-white">{activeSelectedTeam.totalPts}</strong> | AVG ต่อเกม: <strong className="text-emerald-400">{activeSelectedTeam.avgPts}</strong></p>
                </div>
              </div>
              <button onClick={() => setSelectedTeam(null)} className="text-zinc-400 hover:text-white font-bold text-base cursor-pointer">✕</button>
            </div>

            {/* รายชื่อผู้เล่น */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold text-zinc-300">
                รายชื่อผู้เล่นในทีม ({activeSelectedTeam.roster.length} คน{isAdmin ? ` / ทั้งหมด ${activeSelectedTeam.allRoster.length} คน` : ''}):
              </h4>
              {(isAdmin ? activeSelectedTeam.allRoster : activeSelectedTeam.roster).length === 0 ? (
                <p className="text-[10px] text-zinc-500 italic text-center py-2">ยังไม่มีผู้เล่นในทีมนี้</p>
              ) : (
                <div className="space-y-2">
                  {(isAdmin ? activeSelectedTeam.allRoster : activeSelectedTeam.roster).map((p: any) => (
                    <div 
                      key={p.id} 
                      onClick={() => setSelectedPlayerForHistory(p)}
                      className={`p-3 rounded-xl border flex justify-between items-center text-[11px] cursor-pointer hover:border-sky-500 transition ${p.is_resting ? 'bg-zinc-950/40 border-zinc-900 opacity-60' : 'bg-black border-zinc-800'}`}
                    >
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] text-sky-400 font-bold uppercase tracking-wider">{p.role}</span>
                          {p.is_resting && <span className="text-[8px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/30">พักแข่ง</span>}
                        </div>
                        <span className="text-white font-black text-xs hover:text-sky-400">{p.ign}</span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="text-right bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/30">
                          <span className="text-[8px] text-amber-400 block font-bold">KDA รวม</span>
                          <strong className="text-amber-400 text-sm font-black">{p.kda}</strong>
                        </div>

                        {isAdmin && (
                          <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                            <button 
                              onClick={() => handleTogglePlayerRest(p.id, p.is_resting)} 
                              className={`text-[9px] px-2 py-1 rounded border font-bold cursor-pointer transition ${p.is_resting ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-zinc-800 text-zinc-300 border-zinc-700'}`}
                            >
                              {p.is_resting ? 'ให้ลงแข่ง' : 'พักแข่ง'}
                            </button>
                            <button onClick={() => handleDeletePlayer(p.id)} className="text-red-400 hover:text-red-300 text-[10px] bg-red-500/10 px-2 py-1 rounded border border-red-500/20 cursor-pointer">ลบ</button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {isAdmin && (
              <div className="bg-black p-3 rounded-xl border border-zinc-800 space-y-2">
                <h4 className="text-[11px] font-bold text-sky-400">+ เพิ่มผู้เล่นในทีม</h4>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="ชื่อ IGN ผู้เล่น" 
                    value={newPlayerIgn} 
                    onChange={e => setNewPlayerIgn(e.target.value)} 
                    className="flex-1 bg-zinc-900 p-2 rounded-lg text-white border border-zinc-800 text-xs" 
                  />
                  <select 
                    value={newPlayerRole} 
                    onChange={e => setNewPlayerRole(e.target.value)} 
                    className="bg-zinc-900 p-2 rounded-lg text-white border border-zinc-800 text-xs"
                  >
                    <option value="ATK 1">ATK 1</option>
                    <option value="ATK 2">ATK 2</option>
                    <option value="IGL">IGL</option>
                    <option value="Co-iGL">Co-iGL</option>
                    <option value="Scout">Scout</option>
                    <option value="Flex">Flex</option>
                  </select>
                </div>
                <button 
                  onClick={() => handleAddPlayerToTeam(activeSelectedTeam.id)} 
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-1.5 rounded-lg text-xs transition cursor-pointer"
                >
                  เพิ่มผู้เล่นเข้าทีม
                </button>
              </div>
            )}

            <hr className="border-zinc-800" />

            {isAdmin && (
              <div className="bg-black p-3 rounded-xl border border-zinc-800 space-y-2">
                <h4 className="text-[11px] font-bold text-sky-400">+ เพิ่มคะแนนห้องแข่งขัน</h4>
                <input 
                  type="text" 
                  placeholder="ชื่อห้อง (เช่น Room 1 Match 1)" 
                  value={roomNameInput} 
                  onChange={e => setRoomNameInput(e.target.value)} 
                  className="w-full bg-zinc-900 p-2 rounded-lg text-white border border-zinc-800 text-xs" 
                />
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[9px] text-zinc-400 block mb-1">แต้มคิล</label>
                    <input 
                      type="number" 
                      placeholder="0" 
                      value={killPtsInput} 
                      onChange={e => setKillPtsInput(e.target.value === '' ? '' : Number(e.target.value))} 
                      className="w-full bg-zinc-900 p-1.5 rounded-lg text-white border border-zinc-800 text-center font-bold text-sky-400 text-xs" 
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-zinc-400 block mb-1">แต้มอันดับ</label>
                    <input 
                      type="number" 
                      placeholder="0" 
                      value={placePtsInput} 
                      onChange={e => setPlacePtsInput(e.target.value === '' ? '' : Number(e.target.value))} 
                      className="w-full bg-zinc-900 p-1.5 rounded-lg text-white border border-zinc-800 text-center font-bold text-white text-xs" 
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-zinc-400 block mb-1">จำนวนเกม</label>
                    <input 
                      type="number" 
                      min="1"
                      value={matchesInput} 
                      onChange={e => setMatchesInput(Number(e.target.value))} 
                      className="w-full bg-zinc-900 p-1.5 rounded-lg text-white border border-zinc-800 text-center font-bold text-amber-400 text-xs" 
                    />
                  </div>
                </div>
                <button 
                  onClick={() => handleAddTeamScore(activeSelectedTeam.id)} 
                  className="w-full bg-sky-500 hover:bg-sky-400 text-black font-bold py-2 rounded-lg text-xs transition cursor-pointer mt-1"
                >
                  บันทึกคะแนนห้องนี้
                </button>
              </div>
            )}

            <div className="space-y-2">
              <h4 className="text-[11px] font-bold text-zinc-300">ประวัติห้องแข่งขัน ({activeSelectedTeam.scores.length} ห้อง):</h4>
              {activeSelectedTeam.scores.length === 0 ? (
                <p className="text-[10px] text-zinc-500 italic text-center py-2">ยังไม่มีประวัติคะแนน</p>
              ) : (
                <div className="space-y-2">
                  {activeSelectedTeam.scores.map((s: any) => {
                    const roomTotal = (s.kill_points || 0) + (s.placement_points || 0);
                    const roomAvg = (roomTotal / (Number(s.matches) || 5)).toFixed(2);
                    return (
                      <div key={s.id} className="bg-black p-2.5 rounded-xl border border-zinc-800 space-y-2 text-[10px]">
                        <div className="flex justify-between items-center">
                          <div>
                            <strong className="text-white text-xs block">{s.room_name}</strong>
                            <span className="text-zinc-400">คิล: <strong className="text-sky-400">{s.kill_points}</strong> | อันดับ: <strong className="text-white">{s.placement_points}</strong> | เกม: <strong className="text-amber-400">{s.matches}</strong></span>
                          </div>
                          <div className="text-right">
                            <span className="font-black text-sky-400 text-xs block">{roomTotal} แต้ม</span>
                            <span className="text-[9px] text-emerald-400">AVG: {roomAvg}</span>
                          </div>
                        </div>

                        {isAdmin && (
                          <div className="flex gap-2 pt-1 border-t border-zinc-900">
                            <button 
                              onClick={() => openPlayerScoreModal(s)}
                              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-sky-400 py-1 rounded font-bold transition cursor-pointer"
                            >
                              + กรอกคะแนนผู้เล่นรายเกม
                            </button>
                            <button onClick={() => handleDeleteTeamScore(s.id)} className="bg-red-500/20 text-red-400 px-2 py-1 rounded border border-red-500/30 font-bold cursor-pointer">ลบ</button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <button onClick={() => setSelectedTeam(null)} className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded-xl font-bold transition cursor-pointer mt-2">ปิดหน้าต่าง</button>
          </div>
        </div>
      )}

      {/* ================= MODAL: หน้าต่างดูประวัติส่วนตัวของผู้เล่น (เลื่อน Scroll ได้) ================= */}
      {selectedPlayerForHistory && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-50 p-4 text-xs">
          <div className="bg-zinc-900 border border-sky-500/50 w-full max-w-md rounded-2xl p-4 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2 shrink-0">
              <div>
                <span className="text-[9px] text-sky-400 font-bold uppercase">{selectedPlayerForHistory.role}</span>
                <h3 className="font-black text-white text-sm">ประวัติส่วนตัว: {selectedPlayerForHistory.ign}</h3>
              </div>
              <button onClick={() => setSelectedPlayerForHistory(null)} className="text-zinc-400 hover:text-white font-bold text-base cursor-pointer">✕</button>
            </div>

            <div className="overflow-y-auto space-y-3 pr-1">
              
              <div className="grid grid-cols-5 gap-1.5 text-center bg-black p-2.5 rounded-xl border border-zinc-800">
                <div className="bg-zinc-950 p-1.5 rounded border border-zinc-900">
                  <span className="text-[8px] text-zinc-400 block">จำนวนเกม</span>
                  <strong className="text-amber-400 text-xs font-black">{selectedPlayerForHistory.matchesPlayed || 0}</strong>
                </div>
                <div className="bg-zinc-950 p-1.5 rounded border border-zinc-900">
                  <span className="text-[8px] text-zinc-400 block">คิลรวม</span>
                  <strong className="text-sky-400 text-xs font-black">{selectedPlayerForHistory.totalKills}</strong>
                </div>
                <div className="bg-zinc-950 p-1.5 rounded border border-zinc-900">
                  <span className="text-[8px] text-zinc-400 block">แอสซิสต์</span>
                  <strong className="text-emerald-400 text-xs font-black">{selectedPlayerForHistory.totalAssists}</strong>
                </div>
                <div className="bg-zinc-950 p-1.5 rounded border border-zinc-900">
                  <span className="text-[8px] text-zinc-400 block">ดาเมจรวม</span>
                  <strong className="text-white text-xs font-black">{selectedPlayerForHistory.totalDamage}</strong>
                </div>
                <div className="bg-zinc-950 p-1.5 rounded border border-zinc-900">
                  <span className="text-[8px] text-zinc-400 block">KDA เฉลี่ย</span>
                  <strong className="text-amber-400 text-xs font-black">{selectedPlayerForHistory.kda}</strong>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-[11px] font-bold text-zinc-300">ประวัติการลงแข่งแยกตามห้อง:</h4>
                {selectedPlayerForHistory.gameRecords.length === 0 ? (
                  <p className="text-zinc-500 italic text-center py-6">ยังไม่มีประวัติการลงแข่งขันในระบบ</p>
                ) : (
                  <div className="space-y-2">
                    {(() => {
                      const roomGroups: { [scoreId: string]: { roomName: string; kills: number; assists: number; damage: number; gamesCount: number } } = {};
                      
                      selectedPlayerForHistory.gameRecords.forEach((rec: any) => {
                        const roomInfo = teamScores.find(s => String(s.id) === String(rec.team_score_id));
                        const rId = rec.team_score_id;
                        if (!roomGroups[rId]) {
                          roomGroups[rId] = {
                            roomName: roomInfo ? roomInfo.room_name : 'ห้องแข่งขัน',
                            kills: 0,
                            assists: 0,
                            damage: 0,
                            gamesCount: 0
                          };
                        }
                        roomGroups[rId].kills += (rec.kills || 0);
                        roomGroups[rId].assists += (rec.assists || 0);
                        roomGroups[rId].damage += (rec.damage || 0);
                        roomGroups[rId].gamesCount += 1;
                      });

                      return Object.entries(roomGroups).map(([rId, group]) => {
                        const roomKda = group.gamesCount > 0 ? ((group.kills + group.assists) / group.gamesCount).toFixed(2) : '0.00';
                        return (
                          <div key={rId} className="bg-black p-3 rounded-xl border border-zinc-800 space-y-1">
                            <div className="flex justify-between items-center border-b border-zinc-900 pb-1 text-[10px]">
                              <span className="text-sky-400 font-bold">{group.roomName}</span>
                              <span className="text-amber-400 font-bold">ลงแข่ง {group.gamesCount} เกม</span>
                            </div>
                            <div className="grid grid-cols-4 gap-2 text-center pt-1 text-[10px]">
                              <div>
                                <span className="text-[8px] text-zinc-400 block">คิลรวม</span>
                                <strong className="text-sky-400">{group.kills}</strong>
                              </div>
                              <div>
                                <span className="text-[8px] text-zinc-400 block">แอสซิสต์รวม</span>
                                <strong className="text-emerald-400">{group.assists}</strong>
                              </div>
                              <div>
                                <span className="text-[8px] text-zinc-400 block">ดาเมจรวม</span>
                                <strong className="text-white">{group.damage}</strong>
                              </div>
                              <div>
                                <span className="text-[8px] text-zinc-400 block">KDA ห้องนี้</span>
                                <strong className="text-amber-400">{roomKda}</strong>
                              </div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                )}
              </div>

            </div>

            <div className="shrink-0 pt-2 border-t border-zinc-800">
              <button onClick={() => setSelectedPlayerForHistory(null)} className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded-xl font-bold transition cursor-pointer">ปิดหน้าต่าง</button>
            </div>

          </div>
        </div>
      )}

      {/* ================= MODAL: หน้าต่างกรอกคะแนนผู้เล่นรายเกม ================= */}
      {isAdmin && showPlayerScoreModal && selectedRoomForScore && activeSelectedTeam && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 text-xs">
          <div className="bg-zinc-900 border border-sky-500/50 w-full max-w-md rounded-2xl p-4 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
              <div>
                <h3 className="font-bold text-sky-400 text-sm">กรอกคะแนนผู้เล่น: {selectedRoomForScore.room_name}</h3>
                <p className="text-[10px] text-zinc-400">เลือกผู้เล่นลงแข่งสูงสุด 4 คนต่อเกม</p>
              </div>
              <button onClick={() => setShowPlayerScoreModal(false)} className="text-zinc-400 hover:text-white font-bold text-base cursor-pointer">✕</button>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-zinc-300 font-bold block">เลือกเกมที่ต้องการกรอก (จากทั้งหมด {selectedRoomForScore.matches} เกม):</label>
              <select 
                value={selectedGameNo} 
                onChange={(e) => setSelectedGameNo(Number(e.target.value))}
                className="w-full bg-black border border-zinc-700 p-2 rounded-xl text-xs text-white font-bold text-sky-400 cursor-pointer"
              >
                {Array.from({ length: Number(selectedRoomForScore.matches) || 5 }, (_, i) => i + 1).map(gNum => (
                  <option key={gNum} value={gNum}>เกมที่ {gNum}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-sky-400 font-bold">เลือกผู้เล่นลงสนาม (เลือกแล้ว {selectedPlayerIds.length}/4 คน):</span>
              </div>

              {activeSelectedTeam.allRoster.length === 0 ? (
                <p className="text-zinc-500 italic text-center py-4">ยังไม่มีผู้เล่นในทีมนี้ กรุณาเพิ่มผู้เล่นก่อน</p>
              ) : (
                <div className="space-y-2">
                  {activeSelectedTeam.allRoster.map((player: any) => {
                    const isSelected = selectedPlayerIds.includes(player.id);
                    const stats = playerGameStats[player.id] || { kills: '', assists: '', damage: '' };

                    return (
                      <div key={player.id} className={`p-3 rounded-xl border transition space-y-2 ${player.is_resting ? 'opacity-40 border-zinc-900 bg-zinc-950/20' : isSelected ? 'bg-black border-sky-500' : 'bg-zinc-950 border-zinc-800'}`}>
                        <div className="flex justify-between items-center">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] text-sky-400 font-bold uppercase tracking-wider">{player.role}</span>
                              {player.is_resting && <span className="text-[8px] bg-amber-500/20 text-amber-300 px-1 py-0 rounded">กำลังพักแข่ง</span>}
                            </div>
                            <span className="text-white font-black text-xs">{player.ign}</span>
                          </div>
                          {!player.is_resting ? (
                            <button
                              type="button"
                              onClick={() => handleTogglePlayerSelection(player.id)}
                              className={`text-[10px] px-3 py-1 rounded-lg font-bold transition cursor-pointer ${isSelected ? 'bg-emerald-500 text-black shadow' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
                            >
                              {isSelected ? '✓ เลือกแล้ว' : '+ เลือกผู้เล่นนี้'}
                            </button>
                          ) : (
                            <span className="text-[10px] text-amber-400 font-bold">พักแข่งอยู่</span>
                          )}
                        </div>

                        {isSelected && !player.is_resting && (
                          <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-zinc-900 text-[10px]">
                            <div>
                              <span className="text-[9px] text-zinc-400 block mb-0.5">คิล (Kills)</span>
                              <input 
                                type="number" 
                                placeholder="0" 
                                value={stats.kills}
                                onChange={(e) => setPlayerGameStats({
                                  ...playerGameStats,
                                  [player.id]: { ...stats, kills: e.target.value === '' ? '' : Number(e.target.value) }
                                })}
                                className="w-full bg-zinc-900 p-1.5 rounded text-white border border-zinc-700 text-center font-bold text-sky-400" 
                              />
                            </div>
                            <div>
                              <span className="text-[9px] text-zinc-400 block mb-0.5">แอสซิสต์ (Ast)</span>
                              <input 
                                type="number" 
                                placeholder="0" 
                                value={stats.assists}
                                onChange={(e) => setPlayerGameStats({
                                  ...playerGameStats,
                                  [player.id]: { ...stats, assists: e.target.value === '' ? '' : Number(e.target.value) }
                                })}
                                className="w-full bg-zinc-900 p-1.5 rounded text-white border border-zinc-700 text-center font-bold text-emerald-400" 
                              />
                            </div>
                            <div>
                              <span className="text-[9px] text-zinc-400 block mb-0.5">ดาเมจ (Dmg)</span>
                              <input 
                                type="number" 
                                placeholder="0" 
                                value={stats.damage}
                                onChange={(e) => setPlayerGameStats({
                                  ...playerGameStats,
                                  [player.id]: { ...stats, damage: e.target.value === '' ? '' : Number(e.target.value) }
                                })}
                                className="w-full bg-zinc-900 p-1.5 rounded text-white border border-zinc-700 text-center font-bold text-white" 
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <button 
              onClick={handleSavePlayerGameScores}
              className="w-full bg-sky-500 hover:bg-sky-400 text-black font-bold py-2.5 rounded-xl text-xs transition cursor-pointer shadow-lg mt-2"
            >
              บันทึกคะแนนผู้เล่น (เกมที่ {selectedGameNo})
            </button>
          </div>
        </div>
      )}

      {previewImage && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="relative max-w-lg w-full flex flex-col items-center space-y-3">
            <div className="w-full flex justify-between items-center px-1">
              <span className="text-sky-400 font-bold text-xs">{previewImage.title}</span>
              <button onClick={() => setPreviewImage(null)} className="bg-zinc-800 text-white font-bold w-8 h-8 rounded-full flex items-center justify-center cursor-pointer">✕</button>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 p-2 rounded-2xl shadow-2xl max-h-[80vh] flex items-center justify-center w-full">
              <img src={previewImage.url} alt="Preview" className="max-w-full max-h-[70vh] object-contain rounded-xl" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}