'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'teams' | 'players' | 'matches'>('teams');
  const [teamSubTab, setTeamSubTab] = useState<'scrims' | 'tournaments'>('scrims');
  const [matchSubTab, setMatchSubTab] = useState<'scrims' | 'tournaments'>('scrims');
  const [playerStatTab, setPlayerStatTab] = useState<'scrims' | 'tournaments'>('scrims');

  // --- SEARCH & FILTER STATES ---
  const [teamSearchQuery, setTeamSearchQuery] = useState<string>('');
  const [playerSearchQuery, setPlayerSearchQuery] = useState<string>('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('ALL');

  // --- TIME FILTER STATE (เฉพาะฝั่งทีม) ---
  const [timeFilter, setTimeFilter] = useState<'all' | '1d' | '7d' | '30d'>('all');

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
  const [teamLogoUrl, setTeamLogoUrl] = useState('');

  // Player Form States
  const [ign, setIgn] = useState('');
  const [role, setRole] = useState('ATK 1');
  const [subRole, setSubRole] = useState('');
  const [playerTeamId, setPlayerTeamId] = useState('');
  const [playerAvatarUrl, setPlayerAvatarUrl] = useState('');

  // Edit Player States
  const [editingPlayer, setEditingPlayer] = useState<any | null>(null);
  const [editIgn, setEditIgn] = useState('');
  const [editRole, setEditRole] = useState('ATK 1');
  const [editSubRole, setEditSubRole] = useState('');
  const [editPlayerAvatarUrl, setEditPlayerAvatarUrl] = useState('');

  // Tournament & Scrim Form States
  const [tourneyName, setTourneyName] = useState('');
  const [tourneyMatches, setTourneyMatches] = useState('5');
  
  const [scrimName, setScrimName] = useState('');
  const [scrimDate, setScrimDate] = useState(new Date().toISOString().split('T')[0]);
  const [scrimMatches, setScrimMatches] = useState('5');

  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [killPts, setKillPts] = useState('');
  const [placePts, setPlacePts] = useState('');

  const [selectedScrimTeamId, setSelectedScrimTeamId] = useState('');
  const [scrimKillPts, setScrimKillPts] = useState('');
  const [scrimPlacePts, setScrimPlacePts] = useState('');

  const [selectedTeam, setSelectedTeam] = useState<any | null>(null);
  const [teamModalStatTab, setTeamModalStatTab] = useState<'scrims' | 'tournaments'>('scrims');
  const [teamViewMode, setTeamViewMode] = useState<'total' | 'average'>('total');

  const [selectedPlayer, setSelectedPlayer] = useState<any | null>(null);
  const [playerModalTab, setPlayerModalTab] = useState<'scrims' | 'tournaments'>('scrims');

  // --- IMAGE LIGHTBOX POPUP STATE ---
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

  const [newTeamPlayerIgn, setNewTeamPlayerIgn] = useState('');
  const [newTeamPlayerRole, setNewTeamPlayerRole] = useState('ATK 1');
  const [newTeamPlayerSubRole, setNewTeamPlayerSubRole] = useState('');
  const [newTeamPlayerAvatar, setNewTeamPlayerAvatar] = useState('');

  // --- ADD PLAYER STATS ---
  const [addPlayerKillId, setAddPlayerKillId] = useState('');
  const [targetStatType, setTargetStatType] = useState<'scrims' | 'tournaments'>('scrims');
  const [addedMatchesVal, setAddedMatchesVal] = useState('');
  const [addedKillsVal, setAddedKillsVal] = useState('');
  const [addedAssistsVal, setAddedAssistsVal] = useState('');
  const [addedDamageVal, setAddedDamageVal] = useState('');
  const [addedSurvivedVal, setAddedSurvivedVal] = useState('');
  const [addedRescueVal, setAddedRescueVal] = useState('');

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
    if (passInput === 'coachway123') {
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
    await supabase.from('teams').insert([{ 
      name: teamName.trim(), 
      tag: teamTag.trim().toUpperCase(),
      logo_url: teamLogoUrl.trim() || null 
    }]);
    setTeamName(''); setTeamTag(''); setTeamLogoUrl(''); setShowTeamForm(false);
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
      sub_role: subRole || null,
      status: playerTeamId ? 'CONTRACTED' : 'LFT',
      team_id: playerTeamId ? String(playerTeamId) : null,
      avatar_url: playerAvatarUrl.trim() || null,
      total_matches: 0, total_kills: 0, Assists: 0, Damage: 0, Survived: 0, Rescue: 0,
      tourney_matches: 0, tourney_kills: 0, tourney_assists: 0, tourney_damage: 0, tourney_survived: 0, tourney_rescue: 0
    }]);
    setIgn(''); setSubRole(''); setPlayerTeamId(''); setPlayerAvatarUrl(''); setShowPlayerForm(false);
    fetchAllData();
  }

  async function handleUpdatePlayer(e: React.FormEvent) {
    e.preventDefault();
    if (!requireAdmin() || !editingPlayer) return;
    if (!editIgn.trim()) return alert('กรุณากรอกชื่อ IGN');

    const { error } = await supabase.from('players').update({
      ign: editIgn.trim(),
      role: editRole,
      sub_role: editSubRole || null,
      avatar_url: editPlayerAvatarUrl.trim() || null
    }).eq('id', editingPlayer.id);

    if (error) {
      alert('เกิดข้อผิดพลาดในการอัปเดตข้อมูลผู้เล่น: ' + error.message);
      return;
    }

    setEditingPlayer(null);
    fetchAllData();
    alert('อัปเดตข้อมูลผู้เล่นเรียบร้อยแล้ว!');
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

    const addM = parseInt(addedMatchesVal || '0');
    const addK = parseInt(addedKillsVal || '0');
    const addA = parseInt(addedAssistsVal || '0');
    const addD = parseInt(addedDamageVal || '0');
    const addS = parseInt(addedSurvivedVal || '0');
    const addR = parseInt(addedRescueVal || '0');

    let updateData: any = {};
    if (targetStatType === 'scrims') {
      updateData = { 
        total_matches: Number(targetPlayer.total_matches || 0) + addM,
        total_kills: Number(targetPlayer.total_kills || 0) + addK,
        Assists: Number(targetPlayer.Assists || 0) + addA,
        Damage: Number(targetPlayer.Damage || 0) + addD,
        Survived: Number(targetPlayer.Survived || 0) + addS,
        Rescue: Number(targetPlayer.Rescue || 0) + addR
      };
    } else {
      updateData = { 
        tourney_matches: Number(targetPlayer.tourney_matches || 0) + addM,
        tourney_kills: Number(targetPlayer.tourney_kills || 0) + addK,
        tourney_assists: Number(targetPlayer.tourney_assists || 0) + addA,
        tourney_damage: Number(targetPlayer.tourney_damage || 0) + addD,
        tourney_survived: Number(targetPlayer.tourney_survived || 0) + addS,
        tourney_rescue: Number(targetPlayer.tourney_rescue || 0) + addR
      };
    }

    const { error } = await supabase.from('players').update(updateData).eq('id', targetPlayer.id);

    if (error) {
      alert('เกิดข้อผิดพลาดในการอัปเดต: ' + error.message);
      return;
    }

    setAddPlayerKillId(''); 
    setAddedMatchesVal('');
    setAddedKillsVal(''); 
    setAddedAssistsVal(''); 
    setAddedDamageVal(''); 
    setAddedSurvivedVal(''); 
    setAddedRescueVal('');
    
    fetchAllData();
    alert(`อัปเดตสถิติ (${targetStatType === 'scrims' ? 'ห้องซ้อม' : 'ห้องแข่ง'}) ให้ ${targetPlayer.ign} เรียบร้อย!`);
  }

  async function handleResetPlayerStats(playerId: string, playerIgn: string) {
    if (!requireAdmin()) return;
    if (!confirm(`ต้องการล้างคะแนนสถิติทั้งหมดของ "${playerIgn}" ให้เป็น 0 ใช่หรือไม่?`)) return;

    const { error } = await supabase.from('players').update({ 
      total_matches: 0, total_kills: 0, Assists: 0, Damage: 0, Survived: 0, Rescue: 0,
      tourney_matches: 0, tourney_kills: 0, tourney_assists: 0, tourney_damage: 0, tourney_survived: 0, tourney_rescue: 0
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
      sub_role: newTeamPlayerSubRole || null,
      avatar_url: newTeamPlayerAvatar.trim() || null,
      status: 'CONTRACTED',
      team_id: String(teamId),
      total_matches: 0, total_kills: 0, Assists: 0, Damage: 0, Survived: 0, Rescue: 0,
      tourney_matches: 0, tourney_kills: 0, tourney_assists: 0, tourney_damage: 0, tourney_survived: 0, tourney_rescue: 0
    }]);
    setNewTeamPlayerIgn('');
    setNewTeamPlayerSubRole('');
    setNewTeamPlayerAvatar('');
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
    const { data } = await supabase.from('tournaments').insert([{ 
      name: tourneyName.trim(),
      total_matches: parseInt(tourneyMatches || '5')
    }]).select();
    setTourneyName(''); setTourneyMatches('5'); setShowTourneyForm(false);
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
    const { data } = await supabase.from('scrim_tournaments').insert([{ 
      name: scrimName.trim(), 
      scrim_date: scrimDate,
      total_matches: parseInt(scrimMatches || '5')
    }]).select();
    setScrimName(''); setScrimMatches('5'); setShowScrimForm(false);
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

  // --- TIME FILTER HELPER LOGIC (สำหรับฝั่งทีมเท่านั้น) ---
  const now = new Date();
  
  const filterScrimIds = scrimTournaments.filter(st => {
    if (timeFilter === 'all') return true;
    if (!st.scrim_date) return true;
    const stDate = new Date(st.scrim_date);
    const diffTime = now.getTime() - stDate.getTime();
    const diffDays = diffTime / (1000 * 3600 * 24);
    if (timeFilter === '1d') return diffDays <= 1;
    if (timeFilter === '7d') return diffDays <= 7;
    if (timeFilter === '30d') return diffDays <= 30;
    return true;
  }).map(st => st.id);

  const filterTourneyIds = tournaments.filter(tr => {
    if (timeFilter === 'all') return true;
    if (!tr.created_at) return true;
    const trDate = new Date(tr.created_at);
    const diffTime = now.getTime() - trDate.getTime();
    const diffDays = diffTime / (1000 * 3600 * 24);
    if (timeFilter === '1d') return diffDays <= 1;
    if (timeFilter === '7d') return diffDays <= 7;
    if (timeFilter === '30d') return diffDays <= 30;
    return true;
  }).map(tr => tr.id);

  // ฝั่งผู้เล่น + ระบบกรอง Role, Search Bar และ Tie-break (Kill -> Assist -> Damage)
  const filteredPlayers = players.filter(p => {
    const matchesRole = selectedRoleFilter === 'ALL' || p.role === selectedRoleFilter || p.sub_role === selectedRoleFilter;
    const matchesSearch = playerSearchQuery.trim() === '' || p.ign.toLowerCase().includes(playerSearchQuery.toLowerCase().trim());
    return matchesRole && matchesSearch;
  });

  const rankedScrimPlayers = [...filteredPlayers].sort((a, b) => {
    const killsA = a.total_kills || 0;
    const killsB = b.total_kills || 0;
    if (killsB !== killsA) return killsB - killsA;

    const assistA = a.Assists || 0;
    const assistB = b.Assists || 0;
    if (assistB !== assistA) return assistB - assistA;

    const dmgA = a.Damage || 0;
    const dmgB = b.Damage || 0;
    return dmgB - dmgA;
  });

  const rankedTourneyPlayers = [...filteredPlayers].sort((a, b) => {
    const killsA = a.tourney_kills || 0;
    const killsB = b.tourney_kills || 0;
    if (killsB !== killsA) return killsB - killsA;

    const assistA = a.tourney_assists || 0;
    const assistB = b.tourney_assists || 0;
    if (assistB !== assistA) return assistB - assistA;

    const dmgA = a.tourney_damage || 0;
    const dmgB = b.tourney_damage || 0;
    return dmgB - dmgA;
  });

  const teamsWithScores = teams.map(team => {
    const teamTourneyScores = allScores.filter(s => 
      String(s.team_id) === String(team.id) && 
      filterTourneyIds.includes(s.tournament_id)
    );
    
    const teamScrimScores = allScrimScores.filter(s => 
      String(s.team_id) === String(team.id) && 
      filterScrimIds.includes(s.scrim_tournament_id)
    );

    const totalTourneyPts = teamTourneyScores.reduce((sum, s) => sum + (s.kill_points || 0) + (s.placement_points || 0), 0);
    const totalScrimPts = teamScrimScores.reduce((sum, s) => sum + (s.kill_points || 0) + (s.placement_points || 0), 0);

    return {
      ...team,
      totalTourneyPts,
      totalScrimPts,
      roster: players.filter(p => String(p.team_id) === String(team.id))
    };
  });

  const filteredScrimTeams = teamsWithScores.filter(t => {
    if (!teamSearchQuery.trim()) return true;
    const query = teamSearchQuery.toLowerCase().trim();
    return t.name.toLowerCase().includes(query) || t.tag.toLowerCase().includes(query);
  });

  const rankedScrimTeams = [...filteredScrimTeams].sort((a, b) => b.totalScrimPts - a.totalScrimPts);
  const rankedTourneyTeams = [...filteredScrimTeams].sort((a, b) => b.totalTourneyPts - a.totalTourneyPts);

  // --- HELPER FUNCTION: RENDER 5-AXIS RADAR CHART (กราฟ 5 แฉก SVG พร้อมปรับสเกล Survived/Rescue ให้อัตโนมัติ) ---
  const renderRadarChart = (matches: number, kills: number, assists: number, damage: number, survived: number, rescue: number) => {
    const m = matches > 1 ? matches : 1;
    const avgK = kills / m;
    const avgA = assists / m;
    const avgD = damage / m;
    const avgS = survived / m;
    const avgR = rescue / m;

    const pK = Math.min(Math.max((avgK / 4) * 100, 10), 100);
    const pA = Math.min(Math.max((avgA / 3) * 100, 10), 100);
    const pD = Math.min(Math.max((avgD / 800) * 100, 10), 100);
    const pS = Math.min(Math.max((avgS / 1) * 100, 10), 100);
    const pR = Math.min(Math.max((avgR / 1) * 100, 10), 100);

    const size = 180;
    const center = size / 2;
    const radius = 65;

    const getCoordinates = (value: number, index: number) => {
      const angle = (Math.PI * 2 / 5) * index - Math.PI / 2;
      const r = (radius * value) / 100;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      return { x, y };
    };

    const pointsArr = [
      getCoordinates(pK, 0),
      getCoordinates(pA, 1),
      getCoordinates(pD, 2),
      getCoordinates(pR, 3),
      getCoordinates(pS, 4),
    ];

    const pointsString = pointsArr.map(p => `${p.x},${p.y}`).join(' ');

    return (
      <div className="flex flex-col items-center justify-center my-2">
        <svg width={size} height={size} className="overflow-visible">
          {[0.2, 0.4, 0.6, 0.8, 1].map((level, idx) => {
            const lvlPoints = [0, 1, 2, 3, 4].map(i => {
              const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
              const r = radius * level;
              return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
            }).join(' ');
            return (
              <polygon
                key={idx}
                points={lvlPoints}
                fill="none"
                stroke="#27272a"
                strokeWidth="1"
              />
            );
          })}

          {[0, 1, 2, 3, 4].map(i => {
            const pt = getCoordinates(100, i);
            return (
              <line
                key={i}
                x1={center}
                y1={center}
                x2={pt.x}
                y2={pt.y}
                stroke="#3f3f46"
                strokeWidth="1"
              />
            );
          })}

          <polygon
            points={pointsString}
            fill="rgba(56, 189, 248, 0.35)"
            stroke="#38bdf8"
            strokeWidth="2"
          />

          {pointsArr.map((pt, i) => (
            <circle key={i} cx={pt.x} cy={pt.y} r="3" fill="#38bdf8" />
          ))}

          <text x={center} y={center - radius - 8} fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle">Kill</text>
          <text x={center + radius + 14} y={center - 15} fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle">Assist</text>
          <text x={center + radius + 10} y={center + radius + 10} fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle">Dmg</text>
          <text x={center - radius - 12} y={center + radius + 10} fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle">Rescue</text>
          <text x={center - radius - 16} y={center - 15} fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle">Survived</text>
        </svg>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-slate-100 font-sans p-4 max-w-md mx-auto border-x border-zinc-900 shadow-2xl relative">
      {/* Header เมนูหลัก */}
      <header className="py-3 border-b border-zinc-800 mb-4 space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-baseline gap-2">
              <h1 className="text-sm font-black text-sky-400 tracking-wider">iSOTOPE ESPORTS</h1>
              <span className="text-[10px] text-pink-300">| Sponsor By <span className="text-pink-300 font-bold">CONYSWEET</span></span>
            </div>
          </div>
          <div>
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

        {/* เมนูบาร์หลัก 3 เมนู */}
        <div className="grid grid-cols-3 gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
          <button 
            onClick={() => setActiveTab('teams')} 
            className={`py-2 text-xs font-bold rounded-lg transition text-center ${activeTab === 'teams' ? 'bg-sky-500 text-black shadow-md' : 'text-zinc-400 hover:text-white'}`}
          >
            🛡️ Team
          </button>
          <button 
            onClick={() => setActiveTab('players')} 
            className={`py-2 text-xs font-bold rounded-lg transition text-center ${activeTab === 'players' ? 'bg-sky-500 text-black shadow-md' : 'text-zinc-400 hover:text-white'}`}
          >
            🎯 Player
          </button>
          <button 
            onClick={() => setActiveTab('matches')} 
            className={`py-2 text-xs font-bold rounded-lg transition text-center ${activeTab === 'matches' ? 'bg-sky-500 text-black shadow-md' : 'text-zinc-400 hover:text-white'}`}
          >
            📊 SCRIM&TOUR
          </button>
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
            <h2 className="text-xs font-bold text-zinc-300">🏆 ตารางจัดอันดับ Team ({teams.length} ทีม)</h2>
            {isAdmin && teams.length < 20 && (
              <button onClick={() => setShowTeamForm(!showTeamForm)} className="text-xs bg-sky-500 text-black font-bold px-2.5 py-1 rounded">
                {showTeamForm ? 'ปิด' : '+ เพิ่ม Team'}
              </button>
            )}
          </div>

          {isAdmin && showTeamForm && (
            <form onSubmit={handleAddTeam} className="bg-zinc-900 p-3 rounded-xl border border-sky-500/30 space-y-2 text-xs">
              <input type="text" placeholder="ชื่อ Team" value={teamName} onChange={e => setTeamName(e.target.value)} className="w-full bg-black p-2 rounded text-white border border-zinc-800" />
              <input type="text" placeholder="TAG (เช่น ALGX)" value={teamTag} onChange={e => setTeamTag(e.target.value)} className="w-full bg-black p-2 rounded text-white uppercase border border-zinc-800" />
              <input type="text" placeholder="ลิงก์โลโก้ทีม (Logo URL ถ้ามี)" value={teamLogoUrl} onChange={e => setTeamLogoUrl(e.target.value)} className="w-full bg-black p-2 rounded text-white border border-zinc-800" />
              <button type="submit" className="w-full bg-sky-500 text-black font-bold py-1.5 rounded">บันทึก Team</button>
            </form>
          )}

          <input
            type="text"
            placeholder="🔍 ค้นหาชื่อทีมหรือ TAG (Search Team)..."
            value={teamSearchQuery}
            onChange={(e) => setTeamSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500 transition"
          />

          <div className="grid grid-cols-2 gap-1 bg-zinc-900 p-1 rounded-xl text-xs border border-zinc-800">
            <button onClick={() => setTeamSubTab('scrims')} className={`py-1.5 font-bold rounded-lg transition ${teamSubTab === 'scrims' ? 'bg-sky-500 text-black shadow' : 'text-zinc-400'}`}>🏠 คะแนนซ้อม</button>
            <button onClick={() => setTeamSubTab('tournaments')} className={`py-1.5 font-bold rounded-lg transition ${teamSubTab === 'tournaments' ? 'bg-sky-400 text-black shadow' : 'text-zinc-400'}`}>🏆 คะแนนทัวร์</button>
          </div>

          <div className="flex gap-1 bg-zinc-900 p-1 rounded-xl text-[11px] border border-zinc-800">
            <button onClick={() => setTimeFilter('all')} className={`flex-1 py-1 rounded font-bold transition ${timeFilter === 'all' ? 'bg-sky-500 text-black' : 'text-zinc-400 hover:text-white'}`}>ทั้งหมด</button>
            <button onClick={() => setTimeFilter('1d')} className={`flex-1 py-1 rounded font-bold transition ${timeFilter === '1d' ? 'bg-sky-500 text-black' : 'text-zinc-400 hover:text-white'}`}>1 วัน</button>
            <button onClick={() => setTimeFilter('7d')} className={`flex-1 py-1 rounded font-bold transition ${timeFilter === '7d' ? 'bg-sky-500 text-black' : 'text-zinc-400 hover:text-white'}`}>7 วัน</button>
            <button onClick={() => setTimeFilter('30d')} className={`flex-1 py-1 rounded font-bold transition ${timeFilter === '30d' ? 'bg-sky-500 text-black' : 'text-zinc-400 hover:text-white'}`}>30 วัน</button>
          </div>

          <div className="space-y-2.5">
            {teamSubTab === 'scrims' ? (
              rankedScrimTeams.length === 0 ? (
                <div className="bg-zinc-900/40 p-6 rounded-xl border border-zinc-800 text-center text-xs text-zinc-400">ไม่พบข้อมูล Team ที่ค้นหา</div>
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
                        <div className="flex items-center gap-3">
                          {t.logo_url && (
                            <img 
                              src={t.logo_url} 
                              alt={t.name} 
                              onClick={(e) => { e.stopPropagation(); setPreviewImage({ url: t.logo_url, title: `โลโก้ทีม: [${t.tag}] ${t.name}` }); }}
                              className="w-10 h-10 object-contain rounded-lg bg-zinc-950 p-0.5 border border-zinc-800 shrink-0 hover:scale-110 hover:border-sky-400 transition cursor-pointer" 
                              title="คลิกเพื่อดูรูปขนาดใหญ่"
                            />
                          )}
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-black text-sky-400">[{t.tag}]</span>
                              <span className="font-bold text-sm text-white">{t.name}</span>
                            </div>
                            <p className="text-[10px] text-zinc-400 mt-0.5">Player: {t.roster.length} คน</p>
                          </div>
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
                <div className="bg-zinc-900/40 p-6 rounded-xl border border-zinc-800 text-center text-xs text-zinc-400">ไม่พบข้อมูล Team ที่ค้นหา</div>
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
                        <div className="flex items-center gap-3">
                          {t.logo_url && (
                            <img 
                              src={t.logo_url} 
                              alt={t.name} 
                              onClick={(e) => { e.stopPropagation(); setPreviewImage({ url: t.logo_url, title: `โลโก้ทีม: [${t.tag}] ${t.name}` }); }}
                              className="w-10 h-10 object-contain rounded-lg bg-zinc-950 p-0.5 border border-zinc-800 shrink-0 hover:scale-110 hover:border-sky-400 transition cursor-pointer" 
                              title="คลิกเพื่อดูรูปขนาดใหญ่"
                            />
                          )}
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-black text-sky-400">[{t.tag}]</span>
                              <span className="font-bold text-sm text-white">{t.name}</span>
                            </div>
                            <p className="text-[10px] text-zinc-400 mt-0.5">Player: {t.roster.length} คน</p>
                          </div>
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
              <input type="text" placeholder="ลิงก์รูปผู้เล่น (Avatar URL ถ้ามี)" value={playerAvatarUrl} onChange={e => setPlayerAvatarUrl(e.target.value)} className="w-full bg-black p-2 rounded text-white border border-zinc-800" />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">ตำแหน่งหลัก (Role)</label>
                  <select value={role} onChange={e => setRole(e.target.value)} className="w-full bg-black p-2 rounded text-white border border-zinc-800">
                    <option value="ATK 1">ATK 1</option>
                    <option value="ATK 2">ATK 2</option>
                    <option value="IGL">IGL</option>
                    <option value="Scout">Scout</option>
                    <option value="Roaming">Roaming</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">ตำแหน่งรอง (Sub Role)</label>
                  <select value={subRole} onChange={e => setSubRole(e.target.value)} className="w-full bg-black p-2 rounded text-white border border-zinc-800">
                    <option value="">-- ไม่มีตำแหน่งรอง --</option>
                    <option value="ATK 1">ATK 1</option>
                    <option value="ATK 2">ATK 2</option>
                    <option value="IGL">IGL</option>
                    <option value="Scout">Scout</option>
                    <option value="Roaming">Roaming</option>
                  </select>
                </div>
              </div>
              <select value={playerTeamId} onChange={e => setPlayerTeamId(e.target.value)} className="w-full bg-black p-2 rounded text-white border border-zinc-800">
                <option value="">-- Free Agent (LFT) --</option>
                {teams.map(t => <option key={t.id} value={t.id}>[{t.tag}] {t.name}</option>)}
              </select>
              <button type="submit" className="w-full bg-sky-500 text-black font-bold py-1.5 rounded">บันทึก Player</button>
            </form>
          )}

          <div className="space-y-2">
            <input
              type="text"
              placeholder="🔍 ค้นหาชื่อนักแข่ง (Search IGN)..."
              value={playerSearchQuery}
              onChange={(e) => setPlayerSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500 transition"
            />
            <div className="flex gap-1 overflow-x-auto pb-1 text-[10px] bg-zinc-900 p-1 rounded-xl border border-zinc-800">
              {['ALL', 'IGL', 'ATK 1', 'ATK 2', 'Scout', 'Roaming'].map((r) => (
                <button
                  key={r}
                  onClick={() => setSelectedRoleFilter(r)}
                  className={`flex-1 py-1 px-2 rounded font-bold whitespace-nowrap transition ${
                    selectedRoleFilter === r ? 'bg-sky-500 text-black' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {r === 'ALL' ? '🛡️ ทั้งหมด' : r}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1 bg-zinc-900 p-1 rounded-xl text-xs border border-zinc-800">
            <button onClick={() => setPlayerStatTab('scrims')} className={`py-1.5 font-bold rounded-lg transition ${playerStatTab === 'scrims' ? 'bg-sky-500 text-black shadow' : 'text-zinc-400'}`}>🏠 สถิติห้องซ้อม</button>
            <button onClick={() => setPlayerStatTab('tournaments')} className={`py-1.5 font-bold rounded-lg transition ${playerStatTab === 'tournaments' ? 'bg-sky-400 text-black shadow' : 'text-zinc-400'}`}>🏆 สถิติห้องแข่ง</button>
          </div>

          {isAdmin && (
            <form onSubmit={handleUpdatePlayerStats} className="bg-zinc-900 p-3 rounded-xl border border-zinc-800 space-y-2.5">
              <div className="flex justify-between items-center">
                <p className="font-bold text-sky-400">📈 อัปเดตสถิติรายบุคคล</p>
                <select value={targetStatType} onChange={e => setTargetStatType(e.target.value as any)} className="bg-black p-1 rounded text-sky-300 border border-zinc-800 text-[11px]">
                  <option value="scrims">โหมด: ห้องซ้อม</option>
                  <option value="tournaments">โหมด: ห้องแข่ง</option>
                </select>
              </div>
              <select value={addPlayerKillId} onChange={e => setAddPlayerKillId(e.target.value)} className="w-full bg-black p-2 rounded text-white border border-zinc-800">
                <option value="">-- เลือก Player --</option>
                {players.map(p => <option key={p.id} value={p.id}>{p.ign} ({targetStatType === 'scrims' ? `ซ้อม M:${p.total_matches || 0} K:${p.total_kills || 0}` : `แข่ง M:${p.tourney_matches || 0} K:${p.tourney_kills || 0}`})</option>)}
              </select>
              
              <div className="grid grid-cols-6 gap-1">
                <div>
                  <label className="text-[9px] text-zinc-400 block mb-0.5">Match</label>
                  <input type="number" placeholder="+M" value={addedMatchesVal} onChange={e => setAddedMatchesVal(e.target.value)} className="w-full bg-black p-1.5 rounded text-white border border-zinc-800 text-center" />
                </div>
                <div>
                  <label className="text-[9px] text-zinc-400 block mb-0.5">Kill</label>
                  <input type="number" placeholder="+K" value={addedKillsVal} onChange={e => setAddedKillsVal(e.target.value)} className="w-full bg-black p-1.5 rounded text-white border border-zinc-800 text-center" />
                </div>
                <div>
                  <label className="text-[9px] text-zinc-400 block mb-0.5">Assist</label>
                  <input type="number" placeholder="+A" value={addedAssistsVal} onChange={e => setAddedAssistsVal(e.target.value)} className="w-full bg-black p-1.5 rounded text-white border border-zinc-800 text-center" />
                </div>
                <div>
                  <label className="text-[9px] text-zinc-400 block mb-0.5">Damage</label>
                  <input type="number" placeholder="+D" value={addedDamageVal} onChange={e => setAddedDamageVal(e.target.value)} className="w-full bg-black p-1.5 rounded text-white border border-zinc-800 text-center" />
                </div>
                <div>
                  <label className="text-[9px] text-zinc-400 block mb-0.5">Survived</label>
                  <input type="number" placeholder="+S" value={addedSurvivedVal} onChange={e => setAddedSurvivedVal(e.target.value)} className="w-full bg-black p-1.5 rounded text-white border border-zinc-800 text-center" />
                </div>
                <div>
                  <label className="text-[9px] text-zinc-400 block mb-0.5">Rescue</label>
                  <input type="number" placeholder="+R" value={addedRescueVal} onChange={e => setAddedRescueVal(e.target.value)} className="w-full bg-black p-1.5 rounded text-white border border-zinc-800 text-center" />
                </div>
              </div>

              <button type="submit" className="w-full bg-zinc-800 hover:bg-zinc-700 text-sky-400 font-bold py-1.5 rounded border border-sky-500/30">บันทึกเพิ่มสถิติ ({targetStatType === 'scrims' ? 'ห้องซ้อม' : 'ห้องแข่ง'})</button>
            </form>
          )}

          <div className="space-y-2.5">
            {playerStatTab === 'scrims' ? (
              rankedScrimPlayers.length === 0 ? (
                <div className="bg-zinc-900/40 p-6 rounded-xl border border-zinc-800 text-center text-xs text-zinc-400">ไม่พบข้อมูล Player ที่ค้นหา</div>
              ) : (
                rankedScrimPlayers.map((p, idx) => {
                  const teamInfo = teams.find(t => String(t.id) === String(p.team_id));
                  const isTop1 = idx === 0; const isTop2 = idx === 1; const isTop3 = idx === 2;
                  return (
                    <div key={p.id} onClick={() => setSelectedPlayer(p)} className={`p-3.5 rounded-xl border flex flex-col gap-2 cursor-pointer transition ${
                      isTop1 ? 'bg-red-500/10 border-red-500/40 text-red-300' :
                      isTop2 ? 'bg-orange-500/10 border-orange-500/40 text-orange-300' :
                      isTop3 ? 'bg-yellow-500/10 border-yellow-500/40 text-yellow-300' :
                      'bg-zinc-900 border-zinc-800 text-zinc-300'
                    }`}>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs ${
                            isTop1 ? 'bg-red-500 text-white' : isTop2 ? 'bg-orange-500 text-white' : isTop3 ? 'bg-yellow-500 text-black' : 'bg-zinc-800 text-zinc-400'
                          }`}>{idx + 1}</span>
                          <div className="flex items-center gap-3">
                            {p.avatar_url && (
                              <img 
                                src={p.avatar_url} 
                                alt={p.ign} 
                                onClick={(e) => { e.stopPropagation(); setPreviewImage({ url: p.avatar_url, title: `รูปผู้เล่น: ${p.ign}` }); }}
                                className="w-10 h-10 object-cover rounded-lg bg-zinc-950 p-0.5 border border-zinc-800 shrink-0 hover:scale-110 hover:border-sky-400 transition cursor-pointer" 
                                title="คลิกเพื่อดูรูปขนาดใหญ่"
                              />
                            )}
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-sm text-white">{p.ign}</span>
                                <span className="text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-sky-400">{p.role}</span>
                                {p.sub_role && <span className="text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400">รอง: {p.sub_role}</span>}
                              </div>
                              <p className="text-[10px] text-zinc-400 mt-0.5">Team: <span className="text-sky-400 font-bold">{teamInfo ? `[${teamInfo.tag}] ${teamInfo.name}` : 'Free Agent'}</span></p>
                            </div>
                          </div>
                        </div>

                        {isAdmin && (
                          <div className="flex gap-1">
                            <button onClick={(e) => { 
                              e.stopPropagation(); 
                              setEditingPlayer(p); 
                              setEditIgn(p.ign); 
                              setEditRole(p.role || 'ATK 1'); 
                              setEditSubRole(p.sub_role || ''); 
                              setEditPlayerAvatarUrl(p.avatar_url || ''); 
                            }} className="text-xs bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 p-1.5 rounded border border-sky-500/20" title="แก้ไข Player">✏️</button>
                            <button onClick={(e) => { e.stopPropagation(); handleDeletePlayer(p.id, p.ign); }} className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 p-1.5 rounded border border-red-500/20" title="ลบ Player">🗑️</button>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-6 gap-1 bg-zinc-950 p-1.5 rounded-lg border border-zinc-800 text-center text-[10px]">
                        <div><span className="text-zinc-500 block">Match</span><strong className="text-zinc-300">{p.total_matches || 0}</strong></div>
                        <div><span className="text-zinc-500 block">Kill</span><strong className="text-sky-400">{p.total_kills || 0}</strong></div>
                        <div><span className="text-zinc-500 block">Assist</span><strong className="text-sky-300">{p.Assists || 0}</strong></div>
                        <div><span className="text-zinc-500 block">Dmg</span><strong className="text-sky-200">{p.Damage || 0}</strong></div>
                        <div><span className="text-zinc-500 block">Survived</span><strong className="text-emerald-400">{p.Survived || 0}</strong></div>
                        <div><span className="text-zinc-500 block">Rescue</span><strong className="text-amber-400">{p.Rescue || 0}</strong></div>
                      </div>
                    </div>
                  );
                })
              )
            ) : (
              rankedTourneyPlayers.length === 0 ? (
                <div className="bg-zinc-900/40 p-6 rounded-xl border border-zinc-800 text-center text-xs text-zinc-400">ไม่พบข้อมูล Player ที่ค้นหา</div>
              ) : (
                rankedTourneyPlayers.map((p, idx) => {
                  const teamInfo = teams.find(t => String(t.id) === String(p.team_id));
                  const isTop1 = idx === 0; const isTop2 = idx === 1; const isTop3 = idx === 2;
                  return (
                    <div key={p.id} onClick={() => setSelectedPlayer(p)} className={`p-3.5 rounded-xl border flex flex-col gap-2 cursor-pointer transition ${
                      isTop1 ? 'bg-red-500/10 border-red-500/40 text-red-300' :
                      isTop2 ? 'bg-orange-500/10 border-orange-500/40 text-orange-300' :
                      isTop3 ? 'bg-yellow-500/10 border-yellow-500/40 text-yellow-300' :
                      'bg-zinc-900 border-zinc-800 text-zinc-300'
                    }`}>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs ${
                            isTop1 ? 'bg-red-500 text-white' : isTop2 ? 'bg-orange-500 text-white' : isTop3 ? 'bg-yellow-500 text-black' : 'bg-zinc-800 text-zinc-400'
                          }`}>{idx + 1}</span>
                          <div className="flex items-center gap-3">
                            {p.avatar_url && (
                              <img 
                                src={p.avatar_url} 
                                alt={p.ign} 
                                onClick={(e) => { e.stopPropagation(); setPreviewImage({ url: p.avatar_url, title: `รูปผู้เล่น: ${p.ign}` }); }}
                                className="w-10 h-10 object-cover rounded-lg bg-zinc-950 p-0.5 border border-zinc-800 shrink-0 hover:scale-110 hover:border-sky-400 transition cursor-pointer" 
                                title="คลิกเพื่อดูรูปขนาดใหญ่"
                              />
                            )}
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-sm text-white">{p.ign}</span>
                                <span className="text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-sky-400">{p.role}</span>
                                {p.sub_role && <span className="text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400">รอง: {p.sub_role}</span>}
                              </div>
                              <p className="text-[10px] text-zinc-400 mt-0.5">Team: <span className="text-sky-400 font-bold">{teamInfo ? `[${teamInfo.tag}] ${teamInfo.name}` : 'Free Agent'}</span></p>
                            </div>
                          </div>
                        </div>

                        {isAdmin && (
                          <div className="flex gap-1">
                            <button onClick={(e) => { 
                              e.stopPropagation(); 
                              setEditingPlayer(p); 
                              setEditIgn(p.ign); 
                              setEditRole(p.role || 'ATK 1'); 
                              setEditSubRole(p.sub_role || ''); 
                              setEditPlayerAvatarUrl(p.avatar_url || ''); 
                            }} className="text-xs bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 p-1.5 rounded border border-sky-500/20" title="แก้ไข Player">✏️</button>
                            <button onClick={(e) => { e.stopPropagation(); handleDeletePlayer(p.id, p.ign); }} className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 p-1.5 rounded border border-red-500/20" title="ลบ Player">🗑️</button>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-6 gap-1 bg-zinc-950 p-1.5 rounded-lg border border-zinc-800 text-center text-[10px]">
                        <div><span className="text-zinc-500 block">Match</span><strong className="text-zinc-300">{p.tourney_matches || 0}</strong></div>
                        <div><span className="text-zinc-500 block">Kill</span><strong className="text-sky-300">{p.tourney_kills || 0}</strong></div>
                        <div><span className="text-zinc-500 block">Assist</span><strong className="text-sky-200">{p.tourney_assists || 0}</strong></div>
                        <div><span className="text-zinc-500 block">Dmg</span><strong className="text-sky-100">{p.tourney_damage || 0}</strong></div>
                        <div><span className="text-zinc-500 block">Survived</span><strong className="text-emerald-300">{p.tourney_survived || 0}</strong></div>
                        <div><span className="text-zinc-500 block">Rescue</span><strong className="text-amber-300">{p.tourney_rescue || 0}</strong></div>
                      </div>
                    </div>
                  );
                })
              )
            )}
          </div>
        </main>
      )}

      {/* ================= TAB 3: MATCHES (SCRIM&TOUR) ================= */}
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
                  {scrimTournaments.length === 0 ? <option value="">-- ยังไม่มีห้องซ้อม --</option> : scrimTournaments.map(st => <option key={st.id} value={st.id}>🏠 {st.name} ({st.scrim_date}) - {st.total_matches || 5} เกม</option>)}
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
                  <div className="grid grid-cols-2 gap-2">
                    <input type="date" value={scrimDate} onChange={e => setScrimDate(e.target.value)} className="w-full bg-black p-2 rounded text-white border border-zinc-800" />
                    <input type="number" placeholder="จำนวนเกม (เช่น 5)" value={scrimMatches} onChange={e => setScrimMatches(e.target.value)} className="w-full bg-black p-2 rounded text-white border border-zinc-800 text-center" />
                  </div>
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
                            <span className="text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300">{st.scrim_date} ({st.total_matches || 5} เกม)</span>
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
                  {tournaments.length === 0 ? <option value="">-- ยังไม่มีทัวร์นาเมนต์ --</option> : tournaments.map(tr => <option key={tr.id} value={tr.id}>🏆 {tr.name} ({tr.total_matches || 5} เกม)</option>)}
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
                  <input type="number" placeholder="จำนวนเกม (เช่น 5)" value={tourneyMatches} onChange={e => setTourneyMatches(e.target.value)} className="w-full bg-black p-2 rounded text-white border border-zinc-800 text-center" />
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
                            <span className="text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300">({tr.total_matches || 5} เกม)</span>
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
              <div className="flex items-center gap-3">
                {selectedTeam.logo_url && (
                  <img 
                    src={selectedTeam.logo_url} 
                    alt={selectedTeam.name} 
                    onClick={() => setPreviewImage({ url: selectedTeam.logo_url, title: `โลโก้ทีม: [${selectedTeam.tag}] ${selectedTeam.name}` })}
                    className="w-10 h-10 object-contain rounded-lg bg-zinc-950 p-0.5 border border-zinc-800 shrink-0 hover:scale-110 hover:border-sky-400 transition cursor-pointer" 
                    title="คลิกเพื่อดูรูปขนาดใหญ่"
                  />
                )}
                <div>
                  <h3 className="font-bold text-sky-400 text-sm">[{selectedTeam.tag}] {selectedTeam.name}</h3>
                  <p className="text-[10px] text-zinc-400">แต้มซ้อมรวม: <strong className="text-sky-400">{selectedTeam.totalScrimPts}</strong> | แต้มทัวร์รวม: <strong className="text-sky-300">{selectedTeam.totalTourneyPts}</strong></p>
                </div>
              </div>
              <button onClick={() => setSelectedTeam(null)} className="text-zinc-400 hover:text-white font-bold text-base">✕</button>
            </div>

            {isAdmin && (
              <div className="bg-black p-2.5 rounded-lg border border-zinc-800 space-y-1.5">
                <label className="text-[10px] text-sky-400 font-bold uppercase block">✨ สร้าง Player ใหม่เข้า Team นี้</label>
                <input type="text" placeholder="ชื่อ IGN" value={newTeamPlayerIgn} onChange={e => setNewTeamPlayerIgn(e.target.value)} className="w-full bg-zinc-900 p-1.5 rounded text-white mb-1 border border-zinc-800" />
                <input type="text" placeholder="ลิงก์รูปผู้เล่น (Avatar URL)" value={newTeamPlayerAvatar} onChange={e => setNewTeamPlayerAvatar(e.target.value)} className="w-full bg-zinc-900 p-1.5 rounded text-white mb-1 border border-zinc-800" />
                <div className="grid grid-cols-2 gap-1 mb-2">
                  <select value={newTeamPlayerRole} onChange={e => setNewTeamPlayerRole(e.target.value)} className="w-full bg-zinc-900 p-1.5 rounded text-white border border-zinc-800 text-[11px]">
                    <option value="ATK 1">ATK 1</option>
                    <option value="ATK 2">ATK 2</option>
                    <option value="IGL">IGL</option>
                    <option value="Scout">Scout</option>
                    <option value="Roaming">Roaming</option>
                  </select>
                  <select value={newTeamPlayerSubRole} onChange={e => setNewTeamPlayerSubRole(e.target.value)} className="w-full bg-zinc-900 p-1.5 rounded text-white border border-zinc-800 text-[11px]">
                    <option value="">-- ไม่มีตำแหน่งรอง --</option>
                    <option value="ATK 1">ATK 1</option>
                    <option value="ATK 2">ATK 2</option>
                    <option value="IGL">IGL</option>
                    <option value="Scout">Scout</option>
                    <option value="Roaming">Roaming</option>
                  </select>
                </div>
                <button onClick={() => handleCreatePlayerForTeam(selectedTeam.id)} className="w-full bg-sky-500/25 hover:bg-sky-500/35 border border-sky-500/40 text-sky-300 font-bold py-1 rounded">＋ เพิ่ม Player ใหม่</button>
              </div>
            )}

            {/* ปุ่มสลับโหมด มุมมอง ซ้อม / แข่ง ใน Modal ทีม */}
            <div className="grid grid-cols-2 gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
              <button 
                onClick={() => setTeamModalStatTab('scrims')} 
                className={`py-1.5 font-bold rounded-lg transition text-[11px] ${teamModalStatTab === 'scrims' ? 'bg-sky-500 text-black shadow' : 'text-zinc-400 hover:text-white'}`}
              >
                🏠 สถิติซ้อม
              </button>
              <button 
                onClick={() => setTeamModalStatTab('tournaments')} 
                className={`py-1.5 font-bold rounded-lg transition text-[11px] ${teamModalStatTab === 'tournaments' ? 'bg-sky-500 text-black shadow' : 'text-zinc-400 hover:text-white'}`}
              >
                🏆 สถิติแข่ง
              </button>
            </div>

            {/* ปุ่มสลับโหมด ยอดรวม / ค่าเฉลี่ย ต่อเกม */}
            <div className="grid grid-cols-2 gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
              <button 
                onClick={() => setTeamViewMode('total')} 
                className={`py-1 font-bold rounded transition text-[10px] ${teamViewMode === 'total' ? 'bg-zinc-800 text-sky-400 border border-sky-500/30' : 'text-zinc-400 hover:text-white'}`}
              >
                📊 แสดงยอดรวม (Total)
              </button>
              <button 
                onClick={() => setTeamViewMode('average')} 
                className={`py-1 font-bold rounded transition text-[10px] ${teamViewMode === 'average' ? 'bg-zinc-800 text-sky-400 border border-sky-500/30' : 'text-zinc-400 hover:text-white'}`}
              >
                📈 ค่าเฉลี่ย (Per Match)
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-zinc-300 font-bold">👥 Player ใน Team ({players.filter(p => String(p.team_id) === String(selectedTeam.id)).length}):</p>
              {players.filter(p => String(p.team_id) === String(selectedTeam.id)).length === 0 ? (
                <p className="text-zinc-500 italic text-center py-2">ยังไม่มี Player ใน Team นี้</p>
              ) : (
                players.filter(p => String(p.team_id) === String(selectedTeam.id)).map(p => {
                  const sMatch = p.total_matches || 0;
                  const sDiv = sMatch > 0 ? sMatch : 1;

                  const sM = sMatch;
                  const sK = teamViewMode === 'total' ? (p.total_kills || 0) : Number((p.total_kills / sDiv).toFixed(1));
                  const sA = teamViewMode === 'total' ? (p.Assists || 0) : Number((p.Assists / sDiv).toFixed(1));
                  const sD = teamViewMode === 'total' ? (p.Damage || 0) : Number((p.Damage / sDiv).toFixed(1));
                  const sS = teamViewMode === 'total' ? (p.Survived || 0) : Number((p.Survived / sDiv).toFixed(1));
                  const sR = teamViewMode === 'total' ? (p.Rescue || 0) : Number((p.Rescue / sDiv).toFixed(1));

                  const tMatch = p.tourney_matches || 0;
                  const tDiv = tMatch > 0 ? tMatch : 1;

                  const tM = tMatch;
                  const tK = teamViewMode === 'total' ? (p.tourney_kills || 0) : Number((p.tourney_kills / tDiv).toFixed(1));
                  const tA = teamViewMode === 'total' ? (p.tourney_assists || 0) : Number((p.tourney_assists / tDiv).toFixed(1));
                  const tD = teamViewMode === 'total' ? (p.tourney_damage || 0) : Number((p.tourney_damage / tDiv).toFixed(1));
                  const tS = teamViewMode === 'total' ? (p.tourney_survived || 0) : Number((p.tourney_survived / tDiv).toFixed(1));
                  const tR = teamViewMode === 'total' ? (p.tourney_rescue || 0) : Number((p.tourney_rescue / tDiv).toFixed(1));

                  return (
                    <div key={p.id} className="bg-black p-2.5 rounded-lg border border-zinc-800 space-y-1.5">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2.5">
                          {p.avatar_url && (
                            <img 
                              src={p.avatar_url} 
                              alt={p.ign} 
                              onClick={() => setPreviewImage({ url: p.avatar_url, title: `รูปผู้เล่น: ${p.ign}` })}
                              className="w-10 h-10 object-cover rounded-lg bg-zinc-950 p-0.5 border border-zinc-800 shrink-0 hover:scale-110 hover:border-sky-400 transition cursor-pointer" 
                              title="คลิกเพื่อดูรูปขนาดใหญ่"
                            />
                          )}
                          <div>
                            <div className="flex items-center gap-1 flex-wrap">
                              <span className="text-white font-bold text-sm">{p.ign}</span>
                              <span className="text-[10px] text-sky-400 bg-zinc-900 px-1.5 py-0.5 rounded">{p.role}</span>
                              {p.sub_role && <span className="text-[10px] text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded">รอง: {p.sub_role}</span>}
                            </div>
                          </div>
                        </div>
                        {isAdmin && (
                          <div className="flex gap-1">
                            <button onClick={() => { 
                              setEditingPlayer(p); 
                              setEditIgn(p.ign); 
                              setEditRole(p.role || 'ATK 1'); 
                              setEditSubRole(p.sub_role || ''); 
                              setEditPlayerAvatarUrl(p.avatar_url || ''); 
                            }} className="text-[10px] bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 px-2 py-0.5 rounded border border-sky-500/20">แก้ไข</button>
                            <button onClick={() => handleResetPlayerStats(p.id, p.ign)} className="text-[10px] bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 px-2 py-0.5 rounded border border-sky-500/20">ล้างแต้ม</button>
                            <button onClick={() => handleRemovePlayerFromTeam(p.id)} className="text-[10px] bg-red-500/10 hover:bg-red-500/20 text-red-400 px-2 py-0.5 rounded border border-red-500/20">ปลดออก</button>
                          </div>
                        )}
                      </div>

                      {/* แสดงผลตามโหมด (ถ้าเป็น Average จะยุบช่อง Match เหลือ 5 ช่องโชว์ตัวเลขเน้นๆ) */}
                      <div className="bg-zinc-950 p-1.5 rounded-lg border border-zinc-900">
                        {teamModalStatTab === 'scrims' ? (
                          teamViewMode === 'total' ? (
                            <div className="grid grid-cols-6 gap-1 text-center text-[10px]">
                              <div><span className="text-zinc-500 block text-[8px]">Match</span><strong className="text-zinc-300">{sM}</strong></div>
                              <div><span className="text-zinc-500 block text-[8px]">Kill</span><strong className="text-sky-400">{sK}</strong></div>
                              <div><span className="text-zinc-500 block text-[8px]">Assist</span><strong className="text-sky-300">{sA}</strong></div>
                              <div><span className="text-zinc-500 block text-[8px]">Dmg</span><strong className="text-sky-200">{sD}</strong></div>
                              <div><span className="text-zinc-500 block text-[8px]">Survived</span><strong className="text-emerald-400">{sS}</strong></div>
                              <div><span className="text-zinc-500 block text-[8px]">Rescue</span><strong className="text-amber-400">{sR}</strong></div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-5 gap-1 text-center text-[10px]">
                              <div><span className="text-zinc-500 block text-[8px]">Kill/M</span><strong className="text-sky-400">{sK}</strong></div>
                              <div><span className="text-zinc-500 block text-[8px]">Assist/M</span><strong className="text-sky-300">{sA}</strong></div>
                              <div><span className="text-zinc-500 block text-[8px]">Dmg/M</span><strong className="text-sky-200">{sD}</strong></div>
                              <div><span className="text-zinc-500 block text-[8px]">Surv/M</span><strong className="text-emerald-400">{sS}</strong></div>
                              <div><span className="text-zinc-500 block text-[8px]">Rescue/M</span><strong className="text-amber-400">{sR}</strong></div>
                            </div>
                          )
                        ) : (
                          teamViewMode === 'total' ? (
                            <div className="grid grid-cols-6 gap-1 text-center text-[10px]">
                              <div><span className="text-zinc-500 block text-[8px]">Match</span><strong className="text-zinc-300">{tM}</strong></div>
                              <div><span className="text-zinc-500 block text-[8px]">Kill</span><strong className="text-sky-300">{tK}</strong></div>
                              <div><span className="text-zinc-500 block text-[8px]">Assist</span><strong className="text-sky-200">{tA}</strong></div>
                              <div><span className="text-zinc-500 block text-[8px]">Dmg</span><strong className="text-sky-100">{tD}</strong></div>
                              <div><span className="text-zinc-500 block text-[8px]">Survived</span><strong className="text-emerald-300">{tS}</strong></div>
                              <div><span className="text-zinc-500 block text-[8px]">Rescue</span><strong className="text-amber-300">{tR}</strong></div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-5 gap-1 text-center text-[10px]">
                              <div><span className="text-zinc-500 block text-[8px]">Kill/M</span><strong className="text-sky-300">{tK}</strong></div>
                              <div><span className="text-zinc-500 block text-[8px]">Assist/M</span><strong className="text-sky-200">{tA}</strong></div>
                              <div><span className="text-zinc-500 block text-[8px]">Dmg/M</span><strong className="text-sky-100">{tD}</strong></div>
                              <div><span className="text-zinc-500 block text-[8px]">Surv/M</span><strong className="text-emerald-300">{tS}</strong></div>
                              <div><span className="text-zinc-500 block text-[8px]">Rescue/M</span><strong className="text-amber-300">{tR}</strong></div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <button onClick={() => setSelectedTeam(null)} className="w-full bg-zinc-800 text-white py-2 rounded font-bold">ปิดหน้าต่าง</button>
          </div>
        </div>
      )}

      {/* MODAL: EDIT PLAYER */}
      {editingPlayer && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 text-xs">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-xs rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
              <h3 className="font-bold text-sky-400">✏️ แก้ไขข้อมูลผู้เล่น</h3>
              <button onClick={() => setEditingPlayer(null)} className="text-zinc-400 hover:text-white font-bold text-base">✕</button>
            </div>
            
            <form onSubmit={handleUpdatePlayer} className="space-y-3">
              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">ชื่อ IGN</label>
                <input type="text" value={editIgn} onChange={e => setEditIgn(e.target.value)} className="w-full bg-black p-2 rounded text-white border border-zinc-800" />
              </div>
              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">ลิงก์รูปผู้เล่น (Avatar URL)</label>
                <input type="text" value={editPlayerAvatarUrl} onChange={e => setEditPlayerAvatarUrl(e.target.value)} className="w-full bg-black p-2 rounded text-white border border-zinc-800" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">ตำแหน่งหลัก</label>
                  <select value={editRole} onChange={e => setEditRole(e.target.value)} className="w-full bg-black p-2 rounded text-white border border-zinc-800">
                    <option value="ATK 1">ATK 1</option>
                    <option value="ATK 2">ATK 2</option>
                    <option value="IGL">IGL</option>
                    <option value="Scout">Scout</option>
                    <option value="Roaming">Roaming</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">ตำแหน่งรอง</label>
                  <select value={editSubRole} onChange={e => setEditSubRole(e.target.value)} className="w-full bg-black p-2 rounded text-white border border-zinc-800">
                    <option value="">-- ไม่มีตำแหน่งรอง --</option>
                    <option value="ATK 1">ATK 1</option>
                    <option value="ATK 2">ATK 2</option>
                    <option value="IGL">IGL</option>
                    <option value="Scout">Scout</option>
                    <option value="Roaming">Roaming</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 bg-sky-500 text-black font-bold py-2 rounded">บันทึก</button>
                <button type="button" onClick={() => setEditingPlayer(null)} className="flex-1 bg-zinc-800 text-zinc-300 py-2 rounded">ยกเลิก</button>
              </div>
            </form>
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
                <p className="text-[10px] text-zinc-400">วันที่ซ้อม: {selectedScrimDetail.scrim_date} | จำนวนเกม: {selectedScrimDetail.total_matches || 5} เกม</p>
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
                <p className="text-[10px] text-zinc-400">ผลการแข่งขันทางการ | จำนวนเกม: {selectedTourneyDetail.total_matches || 5} เกม</p>
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

      {/* MODAL: PLAYER FULL PROFILE DETAILS + 5-AXIS RADAR CHART */}
      {selectedPlayer && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 text-xs">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-sm rounded-xl p-4 space-y-3 max-h-[90vh] overflow-y-auto">
            <div className="text-center border-b border-zinc-800 pb-3 flex flex-col items-center">
              {selectedPlayer.avatar_url && (
                <img 
                  src={selectedPlayer.avatar_url} 
                  alt={selectedPlayer.ign} 
                  onClick={() => setPreviewImage({ url: selectedPlayer.avatar_url, title: `รูปผู้เล่น: ${selectedPlayer.ign}` })}
                  className="w-16 h-16 object-cover rounded-xl bg-zinc-950 p-0.5 border border-zinc-800 mb-2 hover:scale-105 hover:border-sky-400 transition cursor-pointer" 
                  title="คลิกเพื่อดูรูปขนาดใหญ่"
                />
              )}
              <h3 className="font-black text-white text-base">{selectedPlayer.ign}</h3>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[11px] bg-zinc-800 px-2 py-0.5 rounded text-sky-400">หลัก: {selectedPlayer.role}</span>
                {selectedPlayer.sub_role && <span className="text-[11px] bg-zinc-800 px-2 py-0.5 rounded text-zinc-400">รอง: {selectedPlayer.sub_role}</span>}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
              <button 
                onClick={() => setPlayerModalTab('scrims')} 
                className={`py-1.5 font-bold rounded-lg transition text-[11px] ${playerModalTab === 'scrims' ? 'bg-sky-500 text-black shadow' : 'text-zinc-400 hover:text-white'}`}
              >
                🏠 ห้องซ้อม
              </button>
              <button 
                onClick={() => setPlayerModalTab('tournaments')} 
                className={`py-1.5 font-bold rounded-lg transition text-[11px] ${playerModalTab === 'tournaments' ? 'bg-sky-500 text-black shadow' : 'text-zinc-400 hover:text-white'}`}
              >
                🏆 ห้องแข่ง
              </button>
            </div>

            <div className="space-y-3">
              {playerModalTab === 'scrims' ? (
                <div className="bg-black p-3 rounded-xl border border-zinc-800 space-y-2">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-sky-400 font-bold">🏠 พลังแฝงห้องซ้อม (Scrims Radar)</span>
                    <span className="text-zinc-400">ลง: <strong className="text-white">{selectedPlayer.total_matches || 0} เกม</strong></span>
                  </div>

                  {renderRadarChart(
                    selectedPlayer.total_matches || 0,
                    selectedPlayer.total_kills || 0,
                    selectedPlayer.Assists || 0,
                    selectedPlayer.Damage || 0,
                    selectedPlayer.Survived || 0,
                    selectedPlayer.Rescue || 0
                  )}

                  <div className="grid grid-cols-5 gap-1 text-center text-[10px] bg-zinc-950 p-2 rounded-lg border border-zinc-900">
                    <div><span className="text-zinc-500 block">Kill</span><strong className="text-white">{selectedPlayer.total_kills || 0}</strong></div>
                    <div><span className="text-zinc-500 block">Assist</span><strong className="text-white">{selectedPlayer.Assists || 0}</strong></div>
                    <div><span className="text-zinc-500 block">Damage</span><strong className="text-white">{selectedPlayer.Damage || 0}</strong></div>
                    <div><span className="text-zinc-500 block">Survived</span><strong className="text-emerald-400">{selectedPlayer.Survived || 0}</strong></div>
                    <div><span className="text-zinc-500 block">Rescue</span><strong className="text-amber-400">{selectedPlayer.Rescue || 0}</strong></div>
                  </div>

                  <div className="grid grid-cols-3 gap-1 text-center pt-2 border-t border-zinc-900">
                    <div className="bg-zinc-950 p-1.5 rounded-lg border border-zinc-900">
                      <span className="text-[9px] text-zinc-400 block">Kills/Game</span>
                      <strong className="text-sm font-black text-sky-400">{selectedPlayer.total_matches ? (selectedPlayer.total_kills / selectedPlayer.total_matches).toFixed(1) : 0}</strong>
                    </div>
                    <div className="bg-zinc-950 p-1.5 rounded-lg border border-zinc-900">
                      <span className="text-[9px] text-zinc-400 block">Assists/Game</span>
                      <strong className="text-sm font-black text-sky-300">{selectedPlayer.total_matches ? (selectedPlayer.Assists / selectedPlayer.total_matches).toFixed(1) : 0}</strong>
                    </div>
                    <div className="bg-zinc-950 p-1.5 rounded-lg border border-zinc-900">
                      <span className="text-[9px] text-zinc-400 block">Dmg/Game</span>
                      <strong className="text-sm font-black text-sky-200">{selectedPlayer.total_matches ? Math.round(selectedPlayer.Damage / selectedPlayer.total_matches) : 0}</strong>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-black p-3 rounded-xl border border-zinc-800 space-y-2">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-sky-300 font-bold">🏆 พลังแฝงห้องแข่ง (Tournament Radar)</span>
                    <span className="text-zinc-400">ลง: <strong className="text-white">{selectedPlayer.tourney_matches || 0} เกม</strong></span>
                  </div>

                  {renderRadarChart(
                    selectedPlayer.tourney_matches || 0,
                    selectedPlayer.tourney_kills || 0,
                    selectedPlayer.tourney_assists || 0,
                    selectedPlayer.tourney_damage || 0,
                    selectedPlayer.tourney_survived || 0,
                    selectedPlayer.tourney_rescue || 0
                  )}

                  <div className="grid grid-cols-5 gap-1 text-center text-[10px] bg-zinc-950 p-2 rounded-lg border border-zinc-900">
                    <div><span className="text-zinc-500 block">Kill</span><strong className="text-white">{selectedPlayer.tourney_kills || 0}</strong></div>
                    <div><span className="text-zinc-500 block">Assist</span><strong className="text-white">{selectedPlayer.tourney_assists || 0}</strong></div>
                    <div><span className="text-zinc-500 block">Damage</span><strong className="text-white">{selectedPlayer.tourney_damage || 0}</strong></div>
                    <div><span className="text-zinc-500 block">Survived</span><strong className="text-emerald-300">{selectedPlayer.tourney_survived || 0}</strong></div>
                    <div><span className="text-zinc-500 block">Rescue</span><strong className="text-amber-300">{selectedPlayer.tourney_rescue || 0}</strong></div>
                  </div>

                  <div className="grid grid-cols-3 gap-1 text-center pt-2 border-t border-zinc-900">
                    <div className="bg-zinc-950 p-1.5 rounded-lg border border-zinc-900">
                      <span className="text-[9px] text-zinc-400 block">Kills/Game</span>
                      <strong className="text-sm font-black text-sky-300">{selectedPlayer.tourney_matches ? (selectedPlayer.tourney_kills / selectedPlayer.tourney_matches).toFixed(1) : 0}</strong>
                    </div>
                    <div className="bg-zinc-950 p-1.5 rounded-lg border border-zinc-900">
                      <span className="text-[9px] text-zinc-400 block">Assists/Game</span>
                      <strong className="text-sm font-black text-sky-200">{selectedPlayer.tourney_matches ? (selectedPlayer.tourney_assists / selectedPlayer.tourney_matches).toFixed(1) : 0}</strong>
                    </div>
                    <div className="bg-zinc-950 p-1.5 rounded-lg border border-zinc-900">
                      <span className="text-[9px] text-zinc-400 block">Dmg/Game</span>
                      <strong className="text-sm font-black text-sky-100">{selectedPlayer.tourney_matches ? Math.round(selectedPlayer.tourney_damage / selectedPlayer.tourney_matches) : 0}</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-1">
              {isAdmin && (
                <button onClick={() => handleResetPlayerStats(selectedPlayer.id, selectedPlayer.ign)} className="flex-1 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 py-2 rounded font-bold">🗑️ ล้างสถิติ</button>
              )}
              <button onClick={() => setSelectedPlayer(null)} className="py-2 bg-zinc-800 text-white rounded font-bold flex-1">ปิดหน้าต่าง</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: IMAGE LIGHTBOX POPUP */}
      {previewImage && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="relative max-w-lg w-full flex flex-col items-center space-y-3">
            <div className="w-full flex justify-between items-center px-1">
              <span className="text-sky-400 font-bold text-xs">{previewImage.title}</span>
              <button 
                onClick={() => setPreviewImage(null)} 
                className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold w-8 h-8 rounded-full flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 p-2 rounded-2xl overflow-hidden shadow-2xl max-h-[80vh] flex items-center justify-center w-full">
              <img src={previewImage.url} alt="Preview" className="max-w-full max-h-[70vh] object-contain rounded-xl" />
            </div>
            <button 
              onClick={() => setPreviewImage(null)} 
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-2 rounded-xl text-xs font-bold transition"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      )}
    </div>
  );
}