'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'teams' | 'players' | 'matches'>('teams');
  const [teamSubTab, setTeamSubTab] = useState<'scrims' | 'tournaments'>('scrims');
  const [matchSubTab, setMatchSubTab] = useState<'scrims' | 'tournaments'>('scrims');
  const [playerStatTab, setPlayerStatTab] = useState<'scrims' | 'tournaments'>('scrims');

  // --- CORE STATES ---
  const [teams, setTeams] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [scrimTournaments, setScrimTournaments] = useState<any[]>([]);
  
  const [scores, setScores] = useState<any[]>([]);
  const [allScores, setAllScores] = useState<any[]>([]);
  const [scrimScores, setScrimScores] = useState<any[]>([]);
  const [allScrimScores, setAllScrimScores] = useState<any[]>([]);

  const [selectedTournament, setSelectedTournament] = useState<string>('');
  const [selectedScrimTournament, setSelectedScrimTournament] = useState<string>('');

  // --- ADMIN SECURITY STATES ---
  const [isAdmin, setIsAdmin] = useState(false);
  const [passInput, setPassInput] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);

  // --- MODALS & FORMS ---
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [showPlayerForm, setShowPlayerForm] = useState(false);
  const [showTourneyForm, setShowTourneyForm] = useState(false);
  const [showScrimForm, setShowScrimForm] = useState(false);

  const [selectedScrimDetail, setSelectedScrimDetail] = useState<any | null>(null);
  const [selectedTourneyDetail, setSelectedTourneyDetail] = useState<any | null>(null);

  const [teamName, setTeamName] = useState('');
  const [teamTag, setTeamTag] = useState('');
  const [ign, setIgn] = useState('');
  const [role, setRole] = useState('ATK');
  const [playerTeamId, setPlayerTeamId] = useState('');

  const [tourneyName, setTourneyName] = useState('');
  const [scrimName, setScrimName] = useState('');
  const [scrimDate, setScrimDate] = useState(new Date().toISOString().split('T')[0]);

  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [killPts, setKillPts] = useState('');
  const [placePts, setPlacePts] = useState('');

  const [selectedScrimTeamId, setSelectedScrimTeamId] = useState('');
  const [scrimKillPts, setScrimKillPts] = useState('');
  const [scrimPlacePts, setScrimPlacePts] = useState('');

  const [selectedTeam, setSelectedTeam] = useState<any | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<any | null>(null);

  const [newTeamPlayerIgn, setNewTeamPlayerIgn] = useState('');
  const [newTeamPlayerRole, setNewTeamPlayerRole] = useState('ATK');

  // สต็อกสำหรับอัปเดตสถิติผู้เล่นแยกตามโหมด (ซ้อม / ทัวร์)
  const [addPlayerKillId, setAddPlayerKillId] = useState('');
  const [targetStatType, setTargetStatType] = useState<'scrims' | 'tournaments'>('scrims');
  const [addedKillsVal, setAddedKillsVal] = useState('');
  const [addedAssistsVal, setAddedAssistsVal] = useState('');
  const [addedDamageVal, setAddedDamageVal] = useState('');

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (selectedTournament) fetchScores(selectedTournament);
  }, [selectedTournament]);

  useEffect(() => {
    if (selectedScrimTournament) fetchScrimScores(selectedScrimTournament);
  }, [selectedScrimTournament]);

  async function fetchAllData() {
    try {
      const { data: tData } = await supabase.from('teams').select('*').order('name', { ascending: true });
      const { data: pData } = await supabase.from('players').select('*').order('total_kills', { ascending: false });
      const { data: tourData } = await supabase.from('tournaments').select('*').order('created_at', { ascending: false });
      const { data: scoreData } = await supabase.from('tournament_scores').select('*');
      const { data: scrimData } = await supabase.from('scrim_tournaments').select('*').order('created_at', { ascending: false });
      const { data: scrimScoreData } = await supabase.from('scrim_scores').select('*');

      setTeams(tData || []);
      setPlayers(pData || []);
      setTournaments(tourData || []);
      setAllScores(scoreData || []);
      setScrimTournaments(scrimData || []);
      setAllScrimScores(scrimScoreData || []);

      if (tourData && tourData.length > 0) {
        if (!selectedTournament || !tourData.some((tr: any) => tr.id === selectedTournament)) {
          setSelectedTournament(tourData[0].id);
        }
      } else {
        setSelectedTournament('');
      }
      
      if (scrimData && scrimData.length > 0) {
        if (!selectedScrimTournament || !scrimData.some((st: any) => st.id === selectedScrimTournament)) {
          setSelectedScrimTournament(scrimData[0].id);
        }
      } else {
        setSelectedScrimTournament('');
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchScores(tId: string) {
    if (!tId) {
      setScores([]);
      return;
    }
    const { data } = await supabase.from('tournament_scores').select('*').eq('tournament_id', tId);
    const processed = (data || []).map(s => ({ ...s, total: (s.kill_points || 0) + (s.placement_points || 0) })).sort((a, b) => b.total - a.total);
    setScores(processed);
  }

  async function fetchScrimScores(stId: string) {
    if (!stId) {
      setScrimScores([]);
      return;
    }
    const { data } = await supabase.from('scrim_scores').select('*').eq('scrim_tournament_id', stId);
    const processed = (data || []).map(s => ({ ...s, total: (s.kill_points || 0) + (s.placement_points || 0) })).sort((a, b) => b.total - a.total);
    setScrimScores(processed);
  }

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passInput === 'coachway123') { // รหัสผ่านแอดมิน
      setIsAdmin(true);
      setShowLoginModal(false);
      setPassInput('');
      alert('เข้าสู่ระบบแอดมินสำเร็จ!');
    } else {
      alert('รหัสผ่านไม่ถูกต้อง!');
    }
  };

  const requireAdmin = () => {
    if (!isAdmin) {
      setShowLoginModal(true);
      return false;
    }
    return true;
  };

  async function handleAddTeam(e: React.FormEvent) {
    e.preventDefault();
    if (!requireAdmin()) return;
    if (!teamName.trim() || !teamTag.trim()) return;
    await supabase.from('teams').insert([{ name: teamName.trim(), tag: teamTag.trim().toUpperCase() }]);
    setTeamName(''); setTeamTag(''); setShowTeamForm(false);
    fetchAllData();
  }

  async function handleDeleteTeam(teamId: string, teamName: string) {
    if (!requireAdmin()) return;
    if (!confirm(`ต้องการลบ Team "${teamName}" ใช่หรือไม่?`)) return;
    await supabase.from('teams').delete().eq('id', teamId);
    if (selectedTeam?.id === teamId) setSelectedTeam(null);
    fetchAllData();
  }

  async function handleAddPlayer(e: React.FormEvent) {
    e.preventDefault();
    if (!requireAdmin()) return;
    if (!ign.trim()) return;
    await supabase.from('players').insert([{ 
      ign: ign.trim(), 
      role, 
      status: playerTeamId ? 'CONTRACTED' : 'LFT',
      team_id: playerTeamId ? String(playerTeamId) : null,
      total_kills: 0, Assists: 0, Damage: 0,
      tourney_kills: 0, tourney_assists: 0, tourney_damage: 0
    }]);
    setIgn(''); setPlayerTeamId(''); setShowPlayerForm(false);
    fetchAllData();
  }

  async function handleDeletePlayer(playerId: string, playerIgn: string) {
    if (!requireAdmin()) return;
    if (!confirm(`ต้องการลบ Player "${playerIgn}" ออกจากระบบถาวรใช่หรือไม่?`)) return;
    await supabase.from('players').delete().eq('id', playerId);
    if (selectedPlayer?.id === playerId) setSelectedPlayer(null);
    fetchAllData();
  }

  async function handleUpdatePlayerStats(e: React.FormEvent) {
    e.preventDefault();
    if (!requireAdmin()) return;
    if (!addPlayerKillId) return alert('กรุณาเลือก Player');
    
    const targetPlayer = players.find(p => String(p.id) === String(addPlayerKillId));
    if (!targetPlayer) return;

    const addK = parseInt(addedKillsVal || '0');
    const addA = parseInt(addedAssistsVal || '0');
    const addD = parseInt(addedDamageVal || '0');

    let updateData: any = {};
    if (targetStatType === 'scrims') {
      updateData = { 
        total_kills: Number(targetPlayer.total_kills || 0) + addK,
        Assists: Number(targetPlayer.Assists || 0) + addA,
        Damage: Number(targetPlayer.Damage || 0) + addD
      };
    } else {
      updateData = { 
        tourney_kills: Number(targetPlayer.tourney_kills || 0) + addK,
        tourney_assists: Number(targetPlayer.tourney_assists || 0) + addA,
        tourney_damage: Number(targetPlayer.tourney_damage || 0) + addD
      };
    }

    const { error } = await supabase.from('players').update(updateData).eq('id', targetPlayer.id);

    if (error) {
      alert('เกิดข้อผิดพลาดในการอัปเดต: ' + error.message);
      return;
    }

    setAddPlayerKillId(''); setAddedKillsVal(''); setAddedAssistsVal(''); setAddedDamageVal('');
    fetchAllData();
    alert(`อัปเดตสถิติ (${targetStatType === 'scrims' ? 'ห้องซ้อม' : 'ห้องแข่ง'}) ให้ ${targetPlayer.ign} เรียบร้อย!`);
  }

  async function handleResetPlayerStats(playerId: string, playerIgn: string) {
    if (!requireAdmin()) return;
    if (!confirm(`ต้องการล้างคะแนนสถิติทั้งหมดของ "${playerIgn}" ให้เป็น 0 ใช่หรือไม่?`)) return;

    const { error } = await supabase.from('players').update({ 
      total_kills: 0, Assists: 0, Damage: 0,
      tourney_kills: 0, tourney_assists: 0, tourney_damage: 0
    }).eq('id', playerId);

    if (error) {
      alert('เกิดข้อผิดพลาดในการล้างคะแนน: ' + error.message);
      return;
    }

    setSelectedPlayer(null);
    fetchAllData();
    alert(`ล้างคะแนนของ ${playerIgn} เรียบร้อยแล้ว!`);
  }

  async function handleCreatePlayerForTeam(teamId: string) {
    if (!requireAdmin()) return;
    if (!newTeamPlayerIgn.trim()) return alert('กรุณากรอกชื่อ IGN');
    await supabase.from('players').insert([{
      ign: newTeamPlayerIgn.trim(),
      role: newTeamPlayerRole,
      status: 'CONTRACTED',
      team_id: String(teamId),
      total_kills: 0, Assists: 0, Damage: 0,
      tourney_kills: 0, tourney_assists: 0, tourney_damage: 0
    }]);
    setNewTeamPlayerIgn('');
    await fetchAllData();
  }

  async function handleRemovePlayerFromTeam(playerId: string) {
    if (!requireAdmin()) return;
    await supabase.from('players').update({ team_id: null, status: 'LFT' }).eq('id', playerId);
    fetchAllData();
  }

  async function handleAddTournament(e: React.FormEvent) {
    e.preventDefault();
    if (!requireAdmin()) return;
    if (!tourneyName.trim()) return;
    const { data } = await supabase.from('tournaments').insert([{ name: tourneyName.trim() }]).select();
    setTourneyName(''); setShowTourneyForm(false);
    fetchAllData();
    if (data && data[0]) setSelectedTournament(data[0].id);
  }

  async function handleDeleteTournament(tourneyId: string) {
    if (!requireAdmin()) return;
    const targetTourney = tournaments.find(tr => String(tr.id) === String(tourneyId));
    if (!confirm(`ต้องการลบทัวร์นาเมนต์ "${targetTourney?.name || ''}" ใช่หรือไม่? (คะแนนในทัวร์นี้จะถูกลบทั้งหมด)`)) return;

    await supabase.from('tournament_scores').delete().eq('tournament_id', tourneyId);
    const { error } = await supabase.from('tournaments').delete().eq('id', tourneyId);

    if (error) {
      alert('เกิดข้อผิดพลาดในการลบทัวร์นาเมนต์: ' + error.message);
      return;
    }

    setSelectedTournament('');
    fetchAllData();
    alert('ลบทัวร์นาเมนต์เรียบร้อยแล้ว!');
  }

  async function handleAddScrim(e: React.FormEvent) {
    e.preventDefault();
    if (!requireAdmin()) return;
    if (!scrimName.trim()) return;
    const { data } = await supabase.from('scrim_tournaments').insert([{ name: scrimName.trim(), scrim_date: scrimDate }]).select();
    setScrimName(''); setShowScrimForm(false);
    fetchAllData();
    if (data && data[0]) setSelectedScrimTournament(data[0].id);
  }

  async function handleDeleteScrim(scrimId: string) {
    if (!requireAdmin()) return;
    const targetScrim = scrimTournaments.find(st => String(st.id) === String(scrimId));
    if (!confirm(`ต้องการลบห้องซ้อม "${targetScrim?.name || ''}" ใช่หรือไม่? (คะแนนในห้องนี้จะถูกลบทั้งหมด)`)) return;

    await supabase.from('scrim_scores').delete().eq('scrim_tournament_id', scrimId);
    const { error } = await supabase.from('scrim_tournaments').delete().eq('id', scrimId);

    if (error) {
      alert('เกิดข้อผิดพลาดในการลบห้องซ้อม: ' + error.message);
      return;
    }

    setSelectedScrimTournament('');
    fetchAllData();
    alert('ลบห้องซ้อมเรียบร้อยแล้ว!');
  }

  async function handleAddScore(e: React.FormEvent) {
    e.preventDefault();
    if (!requireAdmin()) return;
    if (!selectedTournament || !selectedTeamId) return;
    await supabase.from('tournament_scores').insert([{
      tournament_id: selectedTournament,
      team_id: selectedTeamId,
      kill_points: parseInt(killPts || '0'),
      placement_points: parseInt(placePts || '0')
    }]);
    setSelectedTeamId(''); setKillPts(''); setPlacePts('');
    fetchScores(selectedTournament);
    fetchAllData();
  }

  async function handleAddScrimScore(e: React.FormEvent) {
    e.preventDefault();
    if (!requireAdmin()) return;
    if (!selectedScrimTournament || !selectedScrimTeamId) return;
    await supabase.from('scrim_scores').insert([{
      scrim_tournament_id: selectedScrimTournament,
      team_id: selectedScrimTeamId,
      kill_points: parseInt(scrimKillPts || '0'),
      placement_points: parseInt(scrimPlacePts || '0')
    }]);
    setSelectedScrimTeamId(''); setScrimKillPts(''); setScrimPlacePts('');
    fetchScrimScores(selectedScrimTournament);
    fetchAllData();
  }

  // จัดอันดับผู้เล่นตามโหมด (ซ้อม / ทัวร์)
  const rankedScrimPlayers = [...players].sort((a, b) => (b.total_kills || 0) - (a.total_kills || 0));
  const rankedTourneyPlayers = [...players].sort((a, b) => (b.tourney_kills || 0) - (a.tourney_kills || 0));

  const validScrimIds = scrimTournaments.map(st => st.id);
  const validTourneyIds = tournaments.map(tr => tr.id);

  const teamsWithScores = teams.map(team => {
    const teamTourneyScores = allScores.filter(s => String(s.team_id) === String(team.id) && validTourneyIds.includes(s.tournament_id));
    const teamScrimScores = allScrimScores.filter(s => String(s.team_id) === String(team.id) && validScrimIds.includes(s.scrim_tournament_id));

    const totalTourneyPts = teamTourneyScores.reduce((sum, s) => sum + (s.kill_points || 0) + (s.placement_points || 0), 0);
    const totalScrimPts = teamScrimScores.reduce((sum, s) => sum + (s.kill_points || 0) + (s.placement_points || 0), 0);

    return {
      ...team,
      totalTourneyPts,
      totalScrimPts,
      roster: players.filter(p => String(p.team_id) === String(team.id))
    };
  });

  const rankedScrimTeams = [...teamsWithScores].sort((a, b) => b.totalScrimPts - a.totalScrimPts);
  const rankedTourneyTeams = [...teamsWithScores].sort((a, b) => b.totalTourneyPts - a.totalTourneyPts);

  return (
    <div className="min-h-screen bg-black text-slate-100 font-sans p-4 max-w-md mx-auto border-x border-zinc-900 shadow-2xl relative">
      {/* Header */}
      <header className="py-3 border-b border-zinc-800 mb-4 flex justify-between items-center">
        <div>
          <div className="flex items-baseline gap-2">
            <h1 className="text-sm font-black text-sky-400 tracking-wider">iSOTOPE ESPORTS</h1>
            <span className="text-[10px] text-pink-300">| Sponsor By <span className="text-pink-300 font-bold">CONYSWEET</span></span>
          </div>
          <div className="mt-1">
            {isAdmin ? (
              <span className="inline-block bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[9px] px-2 py-0.5 rounded font-bold">
                🔓 แอดมิน
              </span>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="bg-zinc-900 hover:bg-zinc-800 text-sky-400 border border-sky-500/30 text-[9px] px-2 py-0.5 rounded font-bold transition"
              >
                🔐 เข้าสู่ระบบแอดมิน
              </button>
            )}
          </div>
        </div>
        <div className="flex gap-1">
          <button onClick={() => setActiveTab('teams')} className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition ${activeTab === 'teams' ? 'bg-sky-500 text-black shadow-md' : 'bg-zinc-900 text-zinc-400 hover:text-white'}`}>🛡️ Team</button>
          <button onClick={() => setActiveTab('players')} className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition ${activeTab === 'players' ? 'bg-sky-500 text-black shadow-md' : 'bg-zinc-900 text-zinc-400 hover:text-white'}`}>🎯 Player</button>
          <button onClick={() => setActiveTab('matches')} className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition ${activeTab === 'matches' ? 'bg-sky-500 text-black shadow-md' : 'bg-zinc-900 text-zinc-400 hover:text-white'}`}>📊 Scrim</button>
        </div>
      </header>

      {/* Admin Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl w-full max-w-xs space-y-4 shadow-2xl">
            <h2 className="text-sm font-bold text-sky-400">ยืนยันตัวตนผู้ดูแลระบบ</h2>
            <p className="text-[11px] text-zinc-400">กรอกรหัสผ่านเพื่อสิทธิ์ในการเพิ่มหรือลบข้อมูล</p>
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
                <button
                  type="submit"
                  className="flex-1 bg-sky-500 hover:bg-sky-400 text-black font-bold py-2 rounded-xl text-xs transition"
                >
                  ยืนยัน
                </button>
                <button
                  type="button"
                  onClick={() => setShowLoginModal(false)}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-2 rounded-xl text-xs transition"
                >
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= TAB 1: TEAMS ================= */}
      {activeTab === 'teams' && (
        <main className="space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-bold text-zinc-300">🏆 ตารางจัดอันดับ Team ({teams.length}/5 ทีม)</h2>
            {isAdmin && teams.length < 5 && (
              <button onClick={() => setShowTeamForm(!showTeamForm)} className="text-xs bg-sky-500 text-black font-bold px-2.5 py-1 rounded">
                {showTeamForm ? 'ปิด' : '+ เพิ่ม Team'}
              </button>
            )}
          </div>

          {isAdmin && showTeamForm && (
            <form onSubmit={handleAddTeam} className="bg-zinc-900 p-3 rounded-xl border border-sky-500/30 space-y-2 text-xs">
              <input type="text" placeholder="ชื่อ Team" value={teamName} onChange={e => setTeamName(e.target.value)} className="w-full bg-black p-2 rounded text-white border border-zinc-800" />
              <input type="text" placeholder="TAG (เช่น ALGX)" value={teamTag} onChange={e => setTeamTag(e.target.value)} className="w-full bg-black p-2 rounded text-white uppercase border border-zinc-800" />
              <button type="submit" className="w-full bg-sky-500 text-black font-bold py-1.5 rounded">บันทึก Team</button>
            </form>
          )}

          <div className="grid grid-cols-2 gap-1 bg-zinc-900 p-1 rounded-xl text-xs border border-zinc-800">
            <button onClick={() => setTeamSubTab('scrims')} className={`py-1.5 font-bold rounded-lg transition ${teamSubTab === 'scrims' ? 'bg-sky-500 text-black shadow' : 'text-zinc-400'}`}>🏠 คะแนนซ้อม</button>
            <button onClick={() => setTeamSubTab('tournaments')} className={`py-1.5 font-bold rounded-lg transition ${teamSubTab === 'tournaments' ? 'bg-sky-400 text-black shadow' : 'text-zinc-400'}`}>🏆 คะแนนทัวร์</button>
          </div>

          <div className="space-y-2.5">
            {teamSubTab === 'scrims' ? (
              rankedScrimTeams.length === 0 ? (
                <div className="bg-zinc-900/40 p-6 rounded-xl border border-zinc-800 text-center text-xs text-zinc-400">ยังไม่มีข้อมูล Team</div>
              ) : (
                rankedScrimTeams.map((t, idx) => {
                  const isTop1 = idx === 0; const isTop2 = idx === 1; const isTop3 = idx === 2;
                  return (
                    <div key={t.id} onClick={() => setSelectedTeam(t)} className={`p-3.5 rounded-xl border flex justify-between items-center cursor-pointer transition shadow-sm ${
                      isTop1 ? 'bg-red-500/10 border-red-500/40 text-red-300' :
                      isTop2 ? 'bg-orange-500/10 border-orange-500/40 text-orange-300' :
                      isTop3 ? 'bg-yellow-500/10 border-yellow-500/40 text-yellow-300' :
                      'bg-zinc-900 border-zinc-800 text-zinc-300'
                    }`}>
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs ${
                          isTop1 ? 'bg-red-500 text-white' : 
                          isTop2 ? 'bg-orange-500 text-white' : 
                          isTop3 ? 'bg-yellow-500 text-black' : 
                          'bg-zinc-800 text-zinc-400'
                        }`}>{idx + 1}</span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-sky-400">[{t.tag}]</span>
                            <span className="font-bold text-sm text-white">{t.name}</span>
                          </div>
                          <p className="text-[10px] text-zinc-400 mt-0.5">Player: {t.roster.length} คน</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-[9px] uppercase font-bold text-zinc-400 block">แต้มซ้อมรวม</span>
                          <span className="text-base font-black text-sky-400">{t.totalScrimPts}</span>
                        </div>
                        {isAdmin && (
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteTeam(t.id, t.name); }} className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 p-1.5 rounded border border-red-500/20" title="ลบ Team">🗑️</button>
                        )}
                      </div>
                    </div>
                  );
                })
              )
            ) : (
              rankedTourneyTeams.length === 0 ? (
                <div className="bg-zinc-900/40 p-6 rounded-xl border border-zinc-800 text-center text-xs text-zinc-400">ยังไม่มีข้อมูล Team</div>
              ) : (
                rankedTourneyTeams.map((t, idx) => {
                  const isTop1 = idx === 0; const isTop2 = idx === 1; const isTop3 = idx === 2;
                  return (
                    <div key={t.id} onClick={() => setSelectedTeam(t)} className={`p-3.5 rounded-xl border flex justify-between items-center cursor-pointer transition shadow-sm ${
                      isTop1 ? 'bg-red-500/10 border-red-500/40 text-red-300' :
                      isTop2 ? 'bg-orange-500/10 border-orange-500/40 text-orange-300' :
                      isTop3 ? 'bg-yellow-500/10 border-yellow-500/40 text-yellow-300' :
                      'bg-zinc-900 border-zinc-800 text-zinc-300'
                    }`}>
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs ${
                          isTop1 ? 'bg-red-500 text-white' : 
                          isTop2 ? 'bg-orange-500 text-white' : 
                          isTop3 ? 'bg-yellow-500 text-black' : 
                          'bg-zinc-800 text-zinc-400'
                        }`}>{idx + 1}</span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-sky-400">[{t.tag}]</span>
                            <span className="font-bold text-sm text-white">{t.name}</span>
                          </div>
                          <p className="text-[10px] text-zinc-400 mt-0.5">Player: {t.roster.length} คน</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-[9px] uppercase font-bold text-zinc-400 block">แต้มทัวร์รวม</span>
                          <span className="text-base font-black text-sky-400">{t.totalTourneyPts}</span>
                        </div>
                        {isAdmin && (
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteTeam(t.id, t.name); }} className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 p-1.5 rounded border border-red-500/20" title="ลบ Team">🗑️</button>
                        )}
                      </div>
                    </div>
                  );
                })
              )
            )}
          </div>
        </main>
      )}

      {/* ================= TAB 2: PLAYERS ================= */}
      {activeTab === 'players' && (
        <main className="space-y-4 text-xs">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-bold text-zinc-300">🎯 Player และสถิตินักแข่ง</h2>
            {isAdmin && (
              <button onClick={() => setShowPlayerForm(!showPlayerForm)} className="bg-sky-500 text-black font-bold px-2.5 py-1 rounded">
                {showPlayerForm ? 'ปิด' : '+ เพิ่ม Player'}
              </button>
            )}
          </div>

          {isAdmin && showPlayerForm && (
            <form onSubmit={handleAddPlayer} className="bg-zinc-900 p-3 rounded-xl border border-sky-500/30 space-y-2">
              <input type="text" placeholder="ชื่อ IGN" value={ign} onChange={e => setIgn(e.target.value)} className="w-full bg-black p-2 rounded text-white border border-zinc-800" />
              <div className="grid grid-cols-2 gap-2">
                <select value={role} onChange={e => setRole(e.target.value)} className="bg-black p-2 rounded text-white border border-zinc-800">
                  <option value="ATK">ATK</option><option value="IGL">IGL</option><option value="Support">Support</option><option value="Scout">Scout</option><option value="Flex">Flex</option>
                </select>
                <select value={playerTeamId} onChange={e => setPlayerTeamId(e.target.value)} className="bg-black p-2 rounded text-white border border-zinc-800">
                  <option value="">-- Free Agent (LFT) --</option>
                  {teams.map(t => <option key={t.id} value={t.id}>[{t.tag}] {t.name}</option>)}
                </select>
              </div>
              <button type="submit" className="w-full bg-sky-500 text-black font-bold py-1.5 rounded">บันทึก Player</button>
            </form>
          )}

          {/* ปุ่มสลับมุมมองสถิติผู้เล่น (ซ้อม / แข่ง) */}
          <div className="grid grid-cols-2 gap-1 bg-zinc-900 p-1 rounded-xl text-xs border border-zinc-800">
            <button onClick={() => setPlayerStatTab('scrims')} className={`py-1.5 font-bold rounded-lg transition ${playerStatTab === 'scrims' ? 'bg-sky-500 text-black shadow' : 'text-zinc-400'}`}>🏠 สถิติห้องซ้อม</button>
            <button onClick={() => setPlayerStatTab('tournaments')} className={`py-1.5 font-bold rounded-lg transition ${playerStatTab === 'tournaments' ? 'bg-sky-400 text-black shadow' : 'text-zinc-400'}`}>🏆 สถิติห้องแข่ง</button>
          </div>

          {isAdmin && (
            <form onSubmit={handleUpdatePlayerStats} className="bg-zinc-900 p-3 rounded-xl border border-zinc-800 space-y-2">
              <div className="flex justify-between items-center">
                <p className="font-bold text-sky-400">📈 อัปเดตสถิติรายบุคคล</p>
                <select value={targetStatType} onChange={e => setTargetStatType(e.target.value as any)} className="bg-black p-1 rounded text-sky-300 border border-zinc-800 text-[11px]">
                  <option value="scrims">โหมด: ห้องซ้อม</option>
                  <option value="tournaments">โหมด: ห้องแข่ง</option>
                </select>
              </div>
              <select value={addPlayerKillId} onChange={e => setAddPlayerKillId(e.target.value)} className="w-full bg-black p-2 rounded text-white border border-zinc-800">
                <option value="">-- เลือก Player --</option>
                {players.map(p => <option key={p.id} value={p.id}>{p.ign} ({targetStatType === 'scrims' ? `ซ้อม K:${p.total_kills || 0}` : `แข่ง K:${p.tourney_kills || 0}`})</option>)}
              </select>
              <div className="grid grid-cols-3 gap-1.5">
                <input type="number" placeholder="+ Kills" value={addedKillsVal} onChange={e => setAddedKillsVal(e.target.value)} className="bg-black p-2 rounded text-white border border-zinc-800" />
                <input type="number" placeholder="+ Assists" value={addedAssistsVal} onChange={e => setAddedAssistsVal(e.target.value)} className="bg-black p-2 rounded text-white border border-zinc-800" />
                <input type="number" placeholder="+ Damage" value={addedDamageVal} onChange={e => setAddedDamageVal(e.target.value)} className="bg-black p-2 rounded text-white border border-zinc-800" />
              </div>
              <button type="submit" className="w-full bg-zinc-800 hover:bg-zinc-700 text-sky-400 font-bold py-1.5 rounded border border-sky-500/30">บันทึกเพิ่มสถิติ ({targetStatType === 'scrims' ? 'ห้องซ้อม' : 'ห้องแข่ง'})</button>
            </form>
          )}

          <div className="space-y-2.5">
            {playerStatTab === 'scrims' ? (
              rankedScrimPlayers.length === 0 ? (
                <div className="bg-zinc-900/40 p-6 rounded-xl border border-zinc-800 text-center text-xs text-zinc-400">ยังไม่มีข้อมูล Player</div>
              ) : (
                rankedScrimPlayers.map((p, idx) => {
                  const teamInfo = teams.find(t => String(t.id) === String(p.team_id));
                  const isTop1 = idx === 0; const isTop2 = idx === 1; const isTop3 = idx === 2;
                  return (
                    <div key={p.id} onClick={() => setSelectedPlayer(p)} className={`p-3.5 rounded-xl border flex justify-between items-center cursor-pointer transition ${
                      isTop1 ? 'bg-red-500/10 border-red-500/40 text-red-300' :
                      isTop2 ? 'bg-orange-500/10 border-orange-500/40 text-orange-300' :
                      isTop3 ? 'bg-yellow-500/10 border-yellow-500/40 text-yellow-300' :
                      'bg-zinc-900 border-zinc-800 text-zinc-300'
                    }`}>
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs ${
                          isTop1 ? 'bg-red-500 text-white' : isTop2 ? 'bg-orange-500 text-white' : isTop3 ? 'bg-yellow-500 text-black' : 'bg-zinc-800 text-zinc-400'
                        }`}>{idx + 1}</span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-sm text-white">{p.ign}</span>
                            <span className="text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-sky-400">{p.role}</span>
                          </div>
                          <p className="text-[10px] text-zinc-400 mt-0.5">Team: <span className="text-sky-400 font-bold">{teamInfo ? `[${teamInfo.tag}] ${teamInfo.name}` : 'Free Agent'}</span></p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right space-y-0.5">
                          <div className="flex gap-2 text-[10px]">
                            <span className="text-zinc-400">K: <strong className="text-sky-400">{p.total_kills || 0}</strong></span>
                            <span className="text-zinc-400">A: <strong className="text-sky-300">{p.Assists || 0}</strong></span>
                            <span className="text-zinc-400">Dmg: <strong className="text-sky-200">{p.Damage || 0}</strong></span>
                          </div>
                        </div>
                        {isAdmin && (
                          <button onClick={(e) => { e.stopPropagation(); handleDeletePlayer(p.id, p.ign); }} className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 p-1.5 rounded border border-red-500/20" title="ลบ Player">🗑️</button>
                        )}
                      </div>
                    </div>
                  );
                })
              )
            ) : (
              rankedTourneyPlayers.length === 0 ? (
                <div className="bg-zinc-900/40 p-6 rounded-xl border border-zinc-800 text-center text-xs text-zinc-400">ยังไม่มีข้อมูล Player</div>
              ) : (
                rankedTourneyPlayers.map((p, idx) => {
                  const teamInfo = teams.find(t => String(t.id) === String(p.team_id));
                  const isTop1 = idx === 0; const isTop2 = idx === 1; const isTop3 = idx === 2;
                  return (
                    <div key={p.id} onClick={() => setSelectedPlayer(p)} className={`p-3.5 rounded-xl border flex justify-between items-center cursor-pointer transition ${
                      isTop1 ? 'bg-red-500/10 border-red-500/40 text-red-300' :
                      isTop2 ? 'bg-orange-500/10 border-orange-500/40 text-orange-300' :
                      isTop3 ? 'bg-yellow-500/10 border-yellow-500/40 text-yellow-300' :
                      'bg-zinc-900 border-zinc-800 text-zinc-300'
                    }`}>
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs ${
                          isTop1 ? 'bg-red-500 text-white' : isTop2 ? 'bg-orange-500 text-white' : isTop3 ? 'bg-yellow-500 text-black' : 'bg-zinc-800 text-zinc-400'
                        }`}>{idx + 1}</span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-sm text-white">{p.ign}</span>
                            <span className="text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-sky-400">{p.role}</span>
                          </div>
                          <p className="text-[10px] text-zinc-400 mt-0.5">Team: <span className="text-sky-400 font-bold">{teamInfo ? `[${teamInfo.tag}] ${teamInfo.name}` : 'Free Agent'}</span></p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right space-y-0.5">
                          <div className="flex gap-2 text-[10px]">
                            <span className="text-zinc-400">K: <strong className="text-sky-300">{p.tourney_kills || 0}</strong></span>
                            <span className="text-zinc-400">A: <strong className="text-sky-200">{p.tourney_assists || 0}</strong></span>
                            <span className="text-zinc-400">Dmg: <strong className="text-sky-100">{p.tourney_damage || 0}</strong></span>
                          </div>
                        </div>
                        {isAdmin && (
                          <button onClick={(e) => { e.stopPropagation(); handleDeletePlayer(p.id, p.ign); }} className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 p-1.5 rounded border border-red-500/20" title="ลบ Player">🗑️</button>
                        )}
                      </div>
                    </div>
                  );
                })
              )
            )}
          </div>
        </main>
      )}

      {/* ================= TAB 3: MATCHES ================= */}
      {activeTab === 'matches' && (
        <main className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
            <button onClick={() => setMatchSubTab('scrims')} className={`py-1.5 font-bold rounded-lg transition ${matchSubTab === 'scrims' ? 'bg-sky-500 text-black shadow' : 'text-zinc-400'}`}>🏠 ห้องซ้อม</button>
            <button onClick={() => setMatchSubTab('tournaments')} className={`py-1.5 font-bold rounded-lg transition ${matchSubTab === 'tournaments' ? 'bg-sky-500 text-black shadow' : 'text-zinc-400'}`}>🏆 ทัวร์</button>
          </div>

          {matchSubTab === 'scrims' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <select value={selectedScrimTournament} onChange={e => setSelectedScrimTournament(e.target.value)} className="flex-1 bg-zinc-900 p-2 rounded text-sky-400 font-bold border border-zinc-800">
                  {scrimTournaments.length === 0 ? <option value="">-- ยังไม่มีห้องซ้อม --</option> : scrimTournaments.map(st => <option key={st.id} value={st.id}>🏠 {st.name} ({st.scrim_date})</option>)}
                </select>
                {isAdmin && selectedScrimTournament && (
                  <button onClick={() => handleDeleteScrim(selectedScrimTournament)} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold px-2.5 py-2 rounded border border-red-500/30" title="ลบห้องซ้อมนี้">🗑️ ลบ</button>
                )}
                {isAdmin && (
                  <button onClick={() => setShowScrimForm(!showScrimForm)} className="bg-sky-500 text-black font-bold px-2.5 py-2 rounded">+ สร้าง</button>
                )}
              </div>

              {isAdmin && showScrimForm && (
                <form onSubmit={handleAddScrim} className="bg-zinc-900 p-3 rounded-xl border border-sky-500/30 space-y-2">
                  <input type="text" placeholder="ชื่อห้องซ้อม" value={scrimName} onChange={e => setScrimName(e.target.value)} className="w-full bg-black p-2 rounded text-white border border-zinc-800" />
                  <input type="date" value={scrimDate} onChange={e => setScrimDate(e.target.value)} className="w-full bg-black p-2 rounded text-white border border-zinc-800" />
                  <button type="submit" className="w-full bg-sky-500 text-black font-bold py-1.5 rounded">สร้างห้องซ้อม</button>
                </form>
              )}

              {isAdmin && selectedScrimTournament && (
                <form onSubmit={handleAddScrimScore} className="bg-zinc-900 p-3 rounded-xl border border-zinc-800 space-y-2">
                  <p className="font-bold text-zinc-300">➕ กรอกแต้มห้องซ้อม Team</p>
                  <select value={selectedScrimTeamId} onChange={e => setSelectedScrimTeamId(e.target.value)} className="w-full bg-black p-2 rounded text-white border border-zinc-800">
                    <option value="">-- เลือก Team --</option>
                    {teams.map(t => <option key={t.id} value={t.id}>[{t.tag}] {t.name}</option>)}
                  </select>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" placeholder="Kill Pts" value={scrimKillPts} onChange={e => setScrimKillPts(e.target.value)} className="bg-black p-2 rounded text-white border border-zinc-800" />
                    <input type="number" placeholder="Place Pts" value={scrimPlacePts} onChange={e => setScrimPlacePts(e.target.value)} className="bg-black p-2 rounded text-white border border-zinc-800" />
                  </div>
                  <button type="submit" className="w-full bg-zinc-800 text-sky-400 border border-sky-500/30 font-bold py-1.5 rounded">บันทึกแต้ม Team</button>
                </form>
              )}

              <div className="space-y-2 pt-2">
                <h3 className="font-bold text-zinc-300">📅 ประวัติห้องซ้อม (คลิกเพื่อดูรายละเอียด)</h3>
                {scrimTournaments.length === 0 ? (
                  <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-800 text-center text-zinc-500">ยังไม่มีประวัติการสร้างห้องซ้อม</div>
                ) : (
                  scrimTournaments.map(st => {
                    const thisScrimScores = allScrimScores.filter(s => String(s.scrim_tournament_id) === String(st.id));
                    return (
                      <div key={st.id} onClick={() => setSelectedScrimDetail(st)} className="bg-zinc-900 hover:bg-zinc-850 p-3 rounded-xl border border-zinc-800 flex justify-between items-center cursor-pointer transition shadow-sm group">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sky-400">🏠 {st.name}</span>
                            <span className="text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300">{st.scrim_date}</span>
                          </div>
                          <p className="text-[10px] text-zinc-400 mt-0.5">จำนวน Team ที่ลงแข่ง: <strong className="text-sky-400">{thisScrimScores.length} Team</strong></p>
                        </div>
                        <span className="text-xs bg-sky-500/10 group-hover:bg-sky-500/20 text-sky-400 font-bold px-2.5 py-1 rounded border border-sky-500/20">🔍 ดูคะแนน</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {matchSubTab === 'tournaments' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <select value={selectedTournament} onChange={e => setSelectedTournament(e.target.value)} className="flex-1 bg-zinc-900 p-2 rounded text-sky-400 font-bold border border-zinc-800">
                  {tournaments.length === 0 ? <option value="">-- ยังไม่มีทัวร์นาเมนต์ --</option> : tournaments.map(tr => <option key={tr.id} value={tr.id}>🏆 {tr.name}</option>)}
                </select>
                {isAdmin && selectedTournament && (
                  <button onClick={() => handleDeleteTournament(selectedTournament)} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold px-2.5 py-2 rounded border border-red-500/30" title="ลบทัวร์นาเมนต์นี้">🗑️ ลบ</button>
                )}
                {isAdmin && (
                  <button onClick={() => setShowTourneyForm(!showTourneyForm)} className="bg-sky-500 text-black font-bold px-2.5 py-2 rounded">+ สร้าง</button>
                )}
              </div>

              {isAdmin && showTourneyForm && (
                <form onSubmit={handleAddTournament} className="bg-zinc-900 p-3 rounded-xl border border-sky-500/30 space-y-2">
                  <input type="text" placeholder="ชื่อทัวร์นาเมนต์" value={tourneyName} onChange={e => setTourneyName(e.target.value)} className="w-full bg-black p-2 rounded text-white border border-zinc-800" />
                  <button type="submit" className="w-full bg-sky-500 text-black font-bold py-1.5 rounded">สร้างทัวร์</button>
                </form>
              )}

              {isAdmin && selectedTournament && (
                <form onSubmit={handleAddScore} className="bg-zinc-900 p-3 rounded-xl border border-zinc-800 space-y-2">
                  <p className="font-bold text-zinc-300">➕ กรอกแต้มทัวร์นาเมนต์ Team</p>
                  <select value={selectedTeamId} onChange={e => setSelectedTeamId(e.target.value)} className="w-full bg-black p-2 rounded text-white border border-zinc-800">
                    <option value="">-- เลือก Team --</option>
                    {teams.map(t => <option key={t.id} value={t.id}>[{t.tag}] {t.name}</option>)}
                  </select>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" placeholder="Kill Pts" value={killPts} onChange={e => setKillPts(e.target.value)} className="bg-black p-2 rounded text-white border border-zinc-800" />
                    <input type="number" placeholder="Place Pts" value={placePts} onChange={e => setPlacePts(e.target.value)} className="bg-black p-2 rounded text-white border border-zinc-800" />
                  </div>
                  <button type="submit" className="w-full bg-zinc-800 text-sky-400 border border-sky-500/30 font-bold py-1.5 rounded">บันทึกแต้ม Team</button>
                </form>
              )}

              <div className="space-y-2 pt-2">
                <h3 className="font-bold text-zinc-300">🏆 ประวัติทัวร์นาเมนต์ (คลิกเพื่อดูรายละเอียด)</h3>
                {tournaments.length === 0 ? (
                  <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-800 text-center text-zinc-500">ยังไม่มีประวัติการสร้างทัวร์นาเมนต์</div>
                ) : (
                  tournaments.map(tr => {
                    const thisTourneyScores = allScores.filter(s => String(s.tournament_id) === String(tr.id));
                    return (
                      <div key={tr.id} onClick={() => setSelectedTourneyDetail(tr)} className="bg-zinc-900 hover:bg-zinc-850 p-3 rounded-xl border border-zinc-800 flex justify-between items-center cursor-pointer transition shadow-sm group">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sky-400">🏆 {tr.name}</span>
                          </div>
                          <p className="text-[10px] text-zinc-400 mt-0.5">จำนวน Team ที่ลงแข่ง: <strong className="text-sky-400">{thisTourneyScores.length} Team</strong></p>
                        </div>
                        <span className="text-xs bg-sky-500/10 group-hover:bg-sky-500/20 text-sky-400 font-bold px-2.5 py-1 rounded border border-sky-500/20">🔍 ดูคะแนน</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </main>
      )}

      {/* MODAL: TEAM DETAILS */}
      {selectedTeam && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 text-xs">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-sm rounded-xl p-4 space-y-3 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
              <div>
                <h3 className="font-bold text-sky-400 text-sm">[{selectedTeam.tag}] {selectedTeam.name}</h3>
                <p className="text-[10px] text-zinc-400">แต้มซ้อมรวม: <strong className="text-sky-400">{selectedTeam.totalScrimPts}</strong> | แต้มทัวร์รวม: <strong className="text-sky-300">{selectedTeam.totalTourneyPts}</strong></p>
              </div>
              <button onClick={() => setSelectedTeam(null)} className="text-zinc-400 hover:text-white font-bold text-base">✕</button>
            </div>

            {isAdmin && (
              <div className="bg-black p-2.5 rounded-lg border border-zinc-800 space-y-1.5">
                <label className="text-[10px] text-sky-400 font-bold uppercase block">✨ สร้าง Player ใหม่เข้า Team นี้</label>
                <input type="text" placeholder="ชื่อ IGN" value={newTeamPlayerIgn} onChange={e => setNewTeamPlayerIgn(e.target.value)} className="w-full bg-zinc-900 p-1.5 rounded text-white mb-1 border border-zinc-800" />
                <select value={newTeamPlayerRole} onChange={e => setNewTeamPlayerRole(e.target.value)} className="w-full bg-zinc-900 p-1.5 rounded text-white mb-2 border border-zinc-800">
                  <option value="ATK">ATK</option><option value="IGL">IGL</option><option value="Support">Support</option><option value="Scout">Scout</option><option value="Flex">Flex</option>
                </select>
                <button onClick={() => handleCreatePlayerForTeam(selectedTeam.id)} className="w-full bg-sky-500/25 hover:bg-sky-500/35 border border-sky-500/40 text-sky-300 font-bold py-1 rounded">＋ เพิ่ม Player ใหม่</button>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-zinc-300 font-bold">👥 Player ใน Team ({players.filter(p => String(p.team_id) === String(selectedTeam.id)).length}):</p>
              {players.filter(p => String(p.team_id) === String(selectedTeam.id)).length === 0 ? (
                <p className="text-zinc-500 italic text-center py-2">ยังไม่มี Player ใน Team นี้</p>
              ) : (
                players.filter(p => String(p.team_id) === String(selectedTeam.id)).map(p => (
                  <div key={p.id} className="bg-black p-2.5 rounded-lg border border-zinc-800 space-y-1">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-white font-bold text-sm">{p.ign}</span>
                        <span className="text-[10px] text-sky-400 ml-2 bg-zinc-900 px-1.5 py-0.5 rounded">{p.role}</span>
                      </div>
                      {isAdmin && (
                        <div className="flex gap-1.5">
                          <button onClick={() => handleResetPlayerStats(p.id, p.ign)} className="text-[10px] bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 px-2 py-0.5 rounded border border-sky-500/20">ล้างแต้ม</button>
                          <button onClick={() => handleRemovePlayerFromTeam(p.id)} className="text-[10px] bg-red-500/10 hover:bg-red-500/20 text-red-400 px-2 py-0.5 rounded border border-red-500/20">ปลดออก</button>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-1 pt-1 text-[10px] bg-zinc-900 p-1.5 rounded text-center">
                      <div><span className="text-zinc-400 block">ซ้อม (K/A/D):</span><strong className="text-sky-400">{p.total_kills || 0} / {p.Assists || 0} / {p.Damage || 0}</strong></div>
                      <div><span className="text-zinc-400 block">แข่ง (K/A/D):</span><strong className="text-sky-300">{p.tourney_kills || 0} / {p.tourney_assists || 0} / {p.tourney_damage || 0}</strong></div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="space-y-2 pt-2 border-t border-zinc-800">
              <p className="text-zinc-300 font-bold">📜 ประวัติคะแนนแยกตามรายการ:</p>
              
              <div className="space-y-1.5">
                <p className="text-[11px] text-sky-400 font-bold">🏠 ห้องซ้อม:</p>
                {allScrimScores.filter(s => String(s.team_id) === String(selectedTeam.id)).length === 0 ? (
                  <p className="text-zinc-500 italic text-[11px]">ยังไม่มีประวัติห้องซ้อม</p>
                ) : (
                  allScrimScores.filter(s => String(s.team_id) === String(selectedTeam.id)).map(scrimScore => {
                    const stInfo = scrimTournaments.find(st => String(st.id) === String(scrimScore.scrim_tournament_id));
                    if (!stInfo) return null;
                    const total = (scrimScore.kill_points || 0) + (scrimScore.placement_points || 0);
                    return (
                      <div key={scrimScore.id} className="bg-black p-2 rounded flex justify-between items-center text-[11px] border border-zinc-800">
                        <span className="text-zinc-300">{stInfo.name} ({stInfo.scrim_date})</span>
                        <span className="font-bold text-sky-400">{total} แต้ม</span>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="space-y-1.5 pt-1">
                <p className="text-[11px] text-sky-300 font-bold">🏆 ทัวร์นาเมนต์:</p>
                {allScores.filter(s => String(s.team_id) === String(selectedTeam.id)).length === 0 ? (
                  <p className="text-zinc-500 italic text-[11px]">ยังไม่มีประวัติทัวร์นาเมนต์</p>
                ) : (
                  allScores.filter(s => String(s.team_id) === String(selectedTeam.id)).map(tourneyScore => {
                    const trInfo = tournaments.find(tr => String(tr.id) === String(tourneyScore.tournament_id));
                    if (!trInfo) return null;
                    const total = (tourneyScore.kill_points || 0) + (tourneyScore.placement_points || 0);
                    return (
                      <div key={tourneyScore.id} className="bg-black p-2 rounded flex justify-between items-center text-[11px] border border-zinc-800">
                        <span className="text-zinc-300">{trInfo.name}</span>
                        <span className="font-bold text-sky-300">{total} แต้ม</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <button onClick={() => setSelectedTeam(null)} className="w-full bg-zinc-800 text-white py-2 rounded font-bold">ปิดหน้าต่าง</button>
          </div>
        </div>
      )}

      {/* MODAL: SCRIM DETAIL POPUP */}
      {selectedScrimDetail && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 text-xs">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-sm rounded-xl p-4 space-y-3 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
              <div>
                <h3 className="font-bold text-sky-400 text-sm">🏠 {selectedScrimDetail.name}</h3>
                <p className="text-[10px] text-zinc-400">วันที่ซ้อม: {selectedScrimDetail.scrim_date}</p>
              </div>
              <button onClick={() => setSelectedScrimDetail(null)} className="text-zinc-400 hover:text-white text-base font-bold">✕</button>
            </div>

            <div className="space-y-2">
              <p className="text-zinc-300 font-bold">📊 ผลคะแนนในห้องซ้อมนี้:</p>
              {allScrimScores.filter(s => String(s.scrim_tournament_id) === String(selectedScrimDetail.id)).length === 0 ? (
                <p className="text-zinc-500 italic text-center py-4">ยังไม่มีการบันทึกคะแนนในวันนี้</p>
              ) : (
                allScrimScores
                  .filter(s => String(s.scrim_tournament_id) === String(selectedScrimDetail.id))
                  .map(s => ({ ...s, total: (s.kill_points || 0) + (s.placement_points || 0) }))
                  .sort((a, b) => b.total - a.total)
                  .map((scoreItem, idx) => {
                    const teamInfo = teams.find(tm => String(tm.id) === String(scoreItem.team_id));
                    return (
                      <div key={scoreItem.id} className="bg-black p-2.5 rounded-lg border border-zinc-800 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] ${
                            idx === 0 ? 'bg-red-500 text-white' : idx === 1 ? 'bg-orange-500 text-white' : idx === 2 ? 'bg-yellow-500 text-black' : 'bg-zinc-800 text-zinc-400'
                          }`}>{idx + 1}</span>
                          <span className="font-bold text-white">[{teamInfo?.tag || 'N/A'}] {teamInfo?.name || 'Unknown Team'}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-sky-400 text-sm">{scoreItem.total} แต้ม</span>
                          <span className="text-[9px] text-zinc-400 block">Kill: {scoreItem.kill_points} | Place: {scoreItem.placement_points}</span>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>

            <button onClick={() => setSelectedScrimDetail(null)} className="w-full bg-zinc-800 text-white py-2 rounded font-bold">ปิดหน้าต่าง</button>
          </div>
        </div>
      )}

      {/* MODAL: TOURNAMENT DETAIL POPUP */}
      {selectedTourneyDetail && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 text-xs">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-sm rounded-xl p-4 space-y-3 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
              <div>
                <h3 className="font-bold text-sky-300 text-sm">🏆 {selectedTourneyDetail.name}</h3>
                <p className="text-[10px] text-zinc-400">ผลการแข่งขันทางการ</p>
              </div>
              <button onClick={() => setSelectedTourneyDetail(null)} className="text-zinc-400 hover:text-white text-base font-bold">✕</button>
            </div>

            <div className="space-y-2">
              <p className="text-zinc-300 font-bold">📊 ผลคะแนนในทัวร์นี้:</p>
              {allScores.filter(s => String(s.tournament_id) === String(selectedTourneyDetail.id)).length === 0 ? (
                <p className="text-zinc-500 italic text-center py-4">ยังไม่มีการบันทึกคะแนนในทัวร์นี้</p>
              ) : (
                allScores
                  .filter(s => String(s.tournament_id) === String(selectedTourneyDetail.id))
                  .map(s => ({ ...s, total: (s.kill_points || 0) + (s.placement_points || 0) }))
                  .sort((a, b) => b.total - a.total)
                  .map((scoreItem, idx) => {
                    const teamInfo = teams.find(tm => String(tm.id) === String(scoreItem.team_id));
                    return (
                      <div key={scoreItem.id} className="bg-black p-2.5 rounded-lg border border-zinc-800 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] ${
                            idx === 0 ? 'bg-red-500 text-white' : idx === 1 ? 'bg-orange-500 text-white' : idx === 2 ? 'bg-yellow-500 text-black' : 'bg-zinc-800 text-zinc-400'
                          }`}>{idx + 1}</span>
                          <span className="font-bold text-white">[{teamInfo?.tag || 'N/A'}] {teamInfo?.name || 'Unknown Team'}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-sky-300 text-sm">{scoreItem.total} แต้ม</span>
                          <span className="text-[9px] text-zinc-400 block">Kill: {scoreItem.kill_points} | Place: {scoreItem.placement_points}</span>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>

            <button onClick={() => setSelectedTourneyDetail(null)} className="w-full bg-zinc-800 text-white py-2 rounded font-bold">ปิดหน้าต่าง</button>
          </div>
        </div>
      )}

      {/* MODAL: PLAYER FULL PROFILE DETAILS */}
      {selectedPlayer && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 text-xs">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-xs rounded-xl p-4 space-y-3">
            <div className="text-center border-b border-zinc-800 pb-3">
              <h3 className="font-black text-white text-base">{selectedPlayer.ign}</h3>
              <p className="text-[11px] text-sky-400 mt-0.5">Role: {selectedPlayer.role}</p>
            </div>
            
            <div className="space-y-2">
              <div className="bg-black p-2 rounded-xl border border-zinc-800 text-center">
                <span className="text-[10px] text-sky-400 font-bold block mb-1">🏠 สถิติห้องซ้อม (Scrims)</span>
                <div className="grid grid-cols-3 gap-1 text-[11px]">
                  <div><span className="text-[9px] text-zinc-400 block">Kills</span><strong className="text-white">{selectedPlayer.total_kills || 0}</strong></div>
                  <div><span className="text-[9px] text-zinc-400 block">Assists</span><strong className="text-white">{selectedPlayer.Assists || 0}</strong></div>
                  <div><span className="text-[9px] text-zinc-400 block">Damage</span><strong className="text-white">{selectedPlayer.Damage || 0}</strong></div>
                </div>
              </div>

              <div className="bg-black p-2 rounded-xl border border-zinc-800 text-center">
                <span className="text-[10px] text-sky-300 font-bold block mb-1">🏆 สถิติห้องแข่ง (Tournaments)</span>
                <div className="grid grid-cols-3 gap-1 text-[11px]">
                  <div><span className="text-[9px] text-zinc-400 block">Kills</span><strong className="text-white">{selectedPlayer.tourney_kills || 0}</strong></div>
                  <div><span className="text-[9px] text-zinc-400 block">Assists</span><strong className="text-white">{selectedPlayer.tourney_assists || 0}</strong></div>
                  <div><span className="text-[9px] text-zinc-400 block">Damage</span><strong className="text-white">{selectedPlayer.tourney_damage || 0}</strong></div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              {isAdmin && (
                <button onClick={() => handleResetPlayerStats(selectedPlayer.id, selectedPlayer.ign)} className="flex-1 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 py-2 rounded font-bold">🗑️ ล้างสถิติ</button>
              )}
              <button onClick={() => setSelectedPlayer(null)} className="flex-1 bg-zinc-800 text-white py-2 rounded font-bold">ปิดหน้าต่าง</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}