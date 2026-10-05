'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Home() {
  const [teamSearchQuery, setTeamSearchQuery] = useState<string>('');

  const [teams, setTeams] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  
  const [allScores, setAllScores] = useState<any[]>([]);
  const [allScrimScores, setAllScrimScores] = useState<any[]>([]);
  const [allScoreHistory, setAllScoreHistory] = useState<any[]>([]);

  const [isAdmin, setIsAdmin] = useState(false);
  const [passInput, setPassInput] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);

  const [showTeamForm, setShowTeamForm] = useState(false);
  const [showPlayerForm, setShowPlayerForm] = useState(false);

  const [teamTag, setTeamTag] = useState('');
  const [teamName, setTeamName] = useState('');
  const [teamLogoUrl, setTeamLogoUrl] = useState('');

  const [ign, setIgn] = useState('');
  const [role, setRole] = useState('ATK 1');
  const [subRole, setSubRole] = useState('');
  const [playerTeamId, setPlayerTeamId] = useState('');
  const [playerAvatarUrl, setPlayerAvatarUrl] = useState('');

  const [selectedTeam, setSelectedTeam] = useState<any | null>(null);
  const [teamModalDetailTab, setTeamModalDetailTab] = useState<'roster' | 'overview' | 'scrims' | 'tournaments'>('roster');

  const [selectedPlayer, setSelectedPlayer] = useState<any | null>(null);
  const [playerModalTab, setPlayerModalTab] = useState<'scrims' | 'tournaments'>('scrims');

  const [showBatchScoreModal, setShowBatchScoreModal] = useState(false);
  const [selectedScrimSessionId, setSelectedScrimSessionId] = useState<string>('');
  const [batchPlayerScores, setBatchPlayerScores] = useState<{ [playerId: string]: { [gameNo: number]: { kills: number | ''; assists: number | ''; damage: number | ''; survived: number | ''; rescue: number | '' } } }>({});

  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [activeHistoryScrim, setActiveHistoryScrim] = useState<any | null>(null);

  const [scrimNameInput, setScrimNameInput] = useState('');
  const [scrimKillPts, setScrimKillPts] = useState(0);
  const [scrimPlacePts, setScrimPlacePts] = useState(0);
  const [scrimMatchesInput, setScrimMatchesInput] = useState(5);

  const [tourneyNameInput, setTourneyNameInput] = useState('');
  const [tourneyKillPts, setTourneyKillPts] = useState(0);
  const [tourneyPlacePts, setTourneyPlacePts] = useState(0);
  const [tourneyMatchesInput, setTourneyMatchesInput] = useState(5);

  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);
  const [imageHasError, setImageHasError] = useState(false);

  const [newTeamPlayerIgn, setNewTeamPlayerIgn] = useState('');
  const [newTeamPlayerRole, setNewTeamPlayerRole] = useState('ATK 1');
  const [newTeamPlayerSubRole, setNewTeamPlayerSubRole] = useState('');
  const [newTeamPlayerAvatar, setNewTeamPlayerAvatar] = useState('');

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    setImageHasError(false);
  }, [selectedPlayer]);

  useEffect(() => {
    if (!showBatchScoreModal || !selectedScrimSessionId || !selectedTeam) return;

    const sessionLogs = allScoreHistory.filter(
      h => String(h.scrim_session_id) === String(selectedScrimSessionId)
    );

    const initialScores: any = {};
    selectedTeam.roster.forEach((player: any) => {
      initialScores[player.id] = {};
      for (let g = 1; g <= 6; g++) {
        const existingLog = sessionLogs.find(l => String(l.player_id) === String(player.id) && Number(l.game_no) === g);
        initialScores[player.id][g] = {
          kills: existingLog && existingLog.kills !== null && existingLog.kills !== undefined ? Number(existingLog.kills) : '',
          assists: existingLog && existingLog.assists !== null && existingLog.assists !== undefined ? Number(existingLog.assists) : '',
          damage: existingLog && existingLog.damage !== null && existingLog.damage !== undefined ? Number(existingLog.damage) : '',
          survived: existingLog && existingLog.survived !== null && existingLog.survived !== undefined ? Number(existingLog.survived) : '',
          rescue: existingLog && existingLog.rescue !== null && existingLog.rescue !== undefined ? Number(existingLog.rescue) : '',
        };
      }
    });
    setBatchPlayerScores(initialScores);
  }, [selectedScrimSessionId, showBatchScoreModal]);

  async function fetchAllData() {
    try {
      const { data: tData } = await supabase.from('teams').select('*').order('name', { ascending: true });
      const { data: pData } = await supabase.from('players').select('*').order('total_kills', { ascending: false });
      const { data: scoreData } = await supabase.from('tournament_scores').select('*');
      const { data: scrimScoreData } = await supabase.from('scrim_scores').select('*');
      const { data: historyData } = await supabase.from('player_score_history').select('*');

      setTeams(tData || []);
      setPlayers(pData || []);
      setAllScores(scoreData || []);
      setAllScrimScores(scrimScoreData || []);
      setAllScoreHistory(historyData || []);
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
    if (!confirm(`ต้องการลบ Team "${teamName}" ใช่หรือไม่`)) return;
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

  // 🌟 ฟังก์ชันรีเซตคะแนนรายบุคคล
  async function handleResetSinglePlayerScores(playerId: string, playerIgn: string) {
    if (!requireAdmin()) return;
    if (!confirm(`ต้องการรีเซตสถิติทั้งหมดของ "${playerIgn}" ให้กลับเป็น 0 ใช่หรือไม่?`)) return;

    try {
      await supabase.from('player_score_history').delete().eq('player_id', String(playerId));

      await supabase.from('players').update({
        total_matches: 0,
        total_kills: 0,
        Assists: 0,
        Damage: 0,
        Survived: 0,
        Rescue: 0,
        tourney_matches: 0,
        tourney_kills: 0,
        tourney_assists: 0,
        tourney_damage: 0,
        tourney_survived: 0,
        tourney_rescue: 0,
        last_scrim_session_id: null
      }).eq('id', playerId);

      alert(`รีเซตสถิติของ ${playerIgn} สำเร็จเรียบร้อย`);
      setSelectedPlayer(null);
      await fetchAllData();
    } catch (err: any) {
      alert('เกิดข้อผิดพลาด: ' + err.message);
    }
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
    setNewTeamPlayerIgn(''); setNewTeamPlayerSubRole(''); setNewTeamPlayerAvatar('');
    await fetchAllData();
  }

  async function handleDeletePlayerCompletely(playerId: string, playerIgn: string) {
    if (!requireAdmin()) return;
    if (!confirm(`ต้องการลบผู้เล่น "${playerIgn}" ออกจากระบบใช่หรือไม่`)) return;
    
    const { error } = await supabase.from('players').delete().eq('id', playerId);
    if (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message);
      return;
    }

    await fetchAllData();
    alert('ลบผู้เล่นออกจากระบบสำเร็จ');
  }

  async function handleDeleteScrimScore(scrimId: string, scrimName: string) {
    if (!requireAdmin()) return;
    if (!confirm(`ต้องการลบประวัติห้องซ้อม "${scrimName}" นี้ใช่หรือไม่`)) return;

    await supabase.from('scrim_scores').delete().eq('id', scrimId);
    await supabase.from('player_score_history').delete().eq('scrim_session_id', scrimId);

    alert('ลบประวัติห้องซ้อมสำเร็จ');
    await fetchAllData();

    const { data: tData } = await supabase.from('teams').select('*');
    const { data: scrimData } = await supabase.from('scrim_scores').select('*');
    const { data: scoreData } = await supabase.from('tournament_scores').select('*');
    const { data: pData } = await supabase.from('players').select('*');

    if (selectedTeam && tData && pData) {
      const refreshed = tData.find((t: any) => String(t.id) === String(selectedTeam.id));
      if (refreshed) {
        const teamScrimScores = (scrimData || []).filter((s: any) => String(s.team_id) === String(refreshed.id));
        const teamTourneyScores = (scoreData || []).filter((s: any) => String(s.team_id) === String(refreshed.id));
        const sortedRoster = pData
          .filter((p: any) => String(p.team_id) === String(refreshed.id))
          .sort((a: any, b: any) => (b.total_kills || 0) - (a.total_kills || 0));

        const totalScrimPts = teamScrimScores.reduce((sum: number, s: any) => sum + (s.kill_points || 0) + (s.placement_points || 0), 0);
        const totalTourneyPts = teamTourneyScores.reduce((sum: number, s: any) => sum + (s.kill_points || 0) + (s.placement_points || 0), 0);
        const totalScrimKillPts = teamScrimScores.reduce((sum: number, s: any) => sum + (s.kill_points || 0), 0);
        const totalScrimPlacePts = teamScrimScores.reduce((sum: number, s: any) => sum + (s.placement_points || 0), 0);
        const totalTourneyKillPts = teamTourneyScores.reduce((sum: number, s: any) => sum + (s.kill_points || 0), 0);
        const totalTourneyPlacePts = teamTourneyScores.reduce((sum: number, s: any) => sum + (s.placement_points || 0), 0);
        const totalScrimMatches = teamScrimScores.reduce((sum: number, s: any) => sum + (Number(s.matches) || 5), 0);
        const totalTourneyMatches = teamTourneyScores.reduce((sum: number, s: any) => sum + (Number(s.matches) || 5), 0);

        setSelectedTeam({
          ...refreshed,
          totalTourneyPts,
          totalScrimPts,
          totalScrimKillPts,
          totalScrimPlacePts,
          totalTourneyKillPts,
          totalTourneyPlacePts,
          totalScrimMatches,
          totalTourneyMatches,
          avgScrimPts: totalScrimMatches > 0 ? (totalScrimPts / totalScrimMatches).toFixed(2) : '0.00',
          avgTourneyPts: totalTourneyMatches > 0 ? (totalTourneyPts / totalTourneyMatches).toFixed(2) : '0.00',
          roster: sortedRoster,
          scrimHistory: teamScrimScores,
          tourneyHistory: teamTourneyScores
        });
      }
    }
  }

  async function handleDeleteTourneyScore(tourneyId: string, tourneyName: string) {
    if (!requireAdmin()) return;
    if (!confirm(`ต้องการลบประวัติทัวร์นาเมนต์ "${tourneyName}" นี้ใช่หรือไม่`)) return;

    await supabase.from('tournament_scores').delete().eq('id', tourneyId);

    alert('ลบประวัติทัวร์นาเมนต์สำเร็จ');
    await fetchAllData();

    const { data: tData } = await supabase.from('teams').select('*');
    const { data: scrimData } = await supabase.from('scrim_scores').select('*');
    const { data: scoreData } = await supabase.from('tournament_scores').select('*');
    const { data: pData } = await supabase.from('players').select('*');

    if (selectedTeam && tData && pData) {
      const refreshed = tData.find((t: any) => String(t.id) === String(selectedTeam.id));
      if (refreshed) {
        const teamScrimScores = (scrimData || []).filter((s: any) => String(s.team_id) === String(refreshed.id));
        const teamTourneyScores = (scoreData || []).filter((s: any) => String(s.team_id) === String(refreshed.id));
        const sortedRoster = pData
          .filter((p: any) => String(p.team_id) === String(refreshed.id))
          .sort((a: any, b: any) => (b.total_kills || 0) - (a.total_kills || 0));

        const totalScrimPts = teamScrimScores.reduce((sum: number, s: any) => sum + (s.kill_points || 0) + (s.placement_points || 0), 0);
        const totalTourneyPts = teamTourneyScores.reduce((sum: number, s: any) => sum + (s.kill_points || 0) + (s.placement_points || 0), 0);
        const totalScrimKillPts = teamScrimScores.reduce((sum: number, s: any) => sum + (s.kill_points || 0), 0);
        const totalScrimPlacePts = teamScrimScores.reduce((sum: number, s: any) => sum + (s.placement_points || 0), 0);
        const totalTourneyKillPts = teamTourneyScores.reduce((sum: number, s: any) => sum + (s.kill_points || 0), 0);
        const totalTourneyPlacePts = teamTourneyScores.reduce((sum: number, s: any) => sum + (s.placement_points || 0), 0);
        const totalScrimMatches = teamScrimScores.reduce((sum: number, s: any) => sum + (Number(s.matches) || 5), 0);
        const totalTourneyMatches = teamTourneyScores.reduce((sum: number, s: any) => sum + (Number(s.matches) || 5), 0);

        setSelectedTeam({
          ...refreshed,
          totalTourneyPts,
          totalScrimPts,
          totalScrimKillPts,
          totalScrimPlacePts,
          totalTourneyKillPts,
          totalTourneyPlacePts,
          totalScrimMatches,
          totalTourneyMatches,
          avgScrimPts: totalScrimMatches > 0 ? (totalScrimPts / totalScrimMatches).toFixed(2) : '0.00',
          avgTourneyPts: totalTourneyMatches > 0 ? (totalTourneyPts / totalTourneyMatches).toFixed(2) : '0.00',
          roster: sortedRoster,
          scrimHistory: teamScrimScores,
          tourneyHistory: teamTourneyScores
        });
      }
    }
  }

  async function handleSaveBatchPlayerScores(team: any) {
    if (!requireAdmin()) return;
    if (!selectedScrimSessionId) return alert('กรุณาเลือกห้องซ้อม/แมตช์ที่ต้องการอ้างอิงก่อน');

    try {
      for (const player of team.roster) {
        const playerGames = batchPlayerScores[player.id];
        if (!playerGames) continue;

        for (let g = 1; g <= 6; g++) {
          const gStats = playerGames[g];
          const hasInput = gStats && gStats.kills !== '' && gStats.kills !== undefined && Number(gStats.kills) >= 0;

          const { data: existingLog } = await supabase
            .from('player_score_history')
            .select('*')
            .eq('scrim_session_id', String(selectedScrimSessionId))
            .eq('player_id', String(player.id))
            .eq('game_no', g)
            .maybeSingle();

          if (!hasInput) {
            if (existingLog) {
              await supabase.from('player_score_history').delete().eq('id', existingLog.id);
            }
          } else {
            const k = Number(gStats.kills) || 0;
            const a = Number(gStats.assists) || 0;
            const d = Number(gStats.damage) || 0;
            const s = Number(gStats.survived) || 0;
            const r = Number(gStats.rescue) || 0;

            if (existingLog) {
              await supabase.from('player_score_history').update({
                kills: k, assists: a, damage: d, survived: s, rescue: r
              }).eq('id', existingLog.id);
            } else {
              await supabase.from('player_score_history').insert([{
                scrim_session_id: String(selectedScrimSessionId),
                team_id: team.id,
                player_id: player.id,
                ign: player.ign,
                matches: 1,
                kills: k, assists: a, damage: d, survived: s, rescue: r,
                game_no: g
              }]);
            }
          }
        }

        const { data: allPlayerLogs } = await supabase
          .from('player_score_history')
          .select('*')
          .eq('player_id', String(player.id));

        const actualTotalMatches = allPlayerLogs ? allPlayerLogs.length : 0;
        const actualTotalKills = (allPlayerLogs || []).reduce((sum, l) => sum + (Number(l.kills) || 0), 0);
        const actualTotalAssists = (allPlayerLogs || []).reduce((sum, l) => sum + (Number(l.assists) || 0), 0);
        const actualTotalDamage = (allPlayerLogs || []).reduce((sum, l) => sum + (Number(l.damage) || 0), 0);
        const actualTotalSurvived = (allPlayerLogs || []).reduce((sum, l) => sum + (Number(l.survived) || 0), 0);
        const actualTotalRescue = (allPlayerLogs || []).reduce((sum, l) => sum + (Number(l.rescue) || 0), 0);

        await supabase.from('players').update({
          total_matches: actualTotalMatches,
          total_kills: actualTotalKills,
          Assists: actualTotalAssists,
          Damage: actualTotalDamage,
          Survived: actualTotalSurvived,
          Rescue: actualTotalRescue,
          last_scrim_session_id: String(selectedScrimSessionId)
        }).eq('id', player.id);
      }

      alert('บันทึกคะแนนผู้เล่นทั้ง 6 เกมสำเร็จเรียบร้อย');
      setShowBatchScoreModal(false);
      setBatchPlayerScores({});
      await fetchAllData();

      const { data: tData } = await supabase.from('teams').select('*');
      const { data: scrimData } = await supabase.from('scrim_scores').select('*');
      const { data: scoreData } = await supabase.from('tournament_scores').select('*');
      const { data: pData } = await supabase.from('players').select('*');

      if (tData && pData) {
        const refreshedTeam = tData.find((t: any) => String(t.id) === String(team.id));
        if (refreshedTeam) {
          const teamScrimScores = (scrimData || []).filter((s: any) => String(s.team_id) === String(refreshedTeam.id));
          const teamTourneyScores = (scoreData || []).filter((s: any) => String(s.team_id) === String(refreshedTeam.id));
          const sortedRoster = pData
            .filter((p: any) => String(p.team_id) === String(refreshedTeam.id))
            .sort((a: any, b: any) => (b.total_kills || 0) - (a.total_kills || 0));

          const totalScrimPts = teamScrimScores.reduce((sum: number, s: any) => sum + (s.kill_points || 0) + (s.placement_points || 0), 0);
          const totalTourneyPts = teamTourneyScores.reduce((sum: number, s: any) => sum + (s.kill_points || 0) + (s.placement_points || 0), 0);
          const totalScrimKillPts = teamScrimScores.reduce((sum: number, s: any) => sum + (s.kill_points || 0), 0);
          const totalScrimPlacePts = teamScrimScores.reduce((sum: number, s: any) => sum + (s.placement_points || 0), 0);
          const totalTourneyKillPts = teamTourneyScores.reduce((sum: number, s: any) => sum + (s.kill_points || 0), 0);
          const totalTourneyPlacePts = teamTourneyScores.reduce((sum: number, s: any) => sum + (s.placement_points || 0), 0);
          const totalScrimMatches = teamScrimScores.reduce((sum: number, s: any) => sum + (Number(s.matches) || 5), 0);
          const totalTourneyMatches = teamTourneyScores.reduce((sum: number, s: any) => sum + (Number(s.matches) || 5), 0);

          setSelectedTeam({
            ...refreshedTeam,
            totalTourneyPts,
            totalScrimPts,
            totalScrimKillPts,
            totalScrimPlacePts,
            totalTourneyKillPts,
            totalTourneyPlacePts,
            totalScrimMatches,
            totalTourneyMatches,
            avgScrimPts: totalScrimMatches > 0 ? (totalScrimPts / totalScrimMatches).toFixed(2) : '0.00',
            avgTourneyPts: totalTourneyMatches > 0 ? (totalTourneyPts / totalTourneyMatches).toFixed(2) : '0.00',
            roster: sortedRoster,
            scrimHistory: teamScrimScores,
            tourneyHistory: teamTourneyScores
          });
        }
      }

      if (pData && selectedPlayer) {
        const updatedCurrentPlayer = pData.find((p: any) => String(p.id) === String(selectedPlayer.id));
        if (updatedCurrentPlayer) {
          setSelectedPlayer(updatedCurrentPlayer);
        }
      }
    } catch (err: any) {
      alert('เกิดข้อผิดพลาด: ' + err.message);
    }
  }

  async function handleAddScrimScore(teamId: string) {
    if (!requireAdmin()) return;
    if (!scrimNameInput.trim()) return alert('กรุณากรอกชื่อห้องซ้อม');
    const { error } = await supabase.from('scrim_scores').insert([{
      scrim_name: scrimNameInput.trim(),
      team_id: teamId,
      kill_points: Number(scrimKillPts) || 0,
      placement_points: Number(scrimPlacePts) || 0,
      matches: Number(scrimMatchesInput) || 5
    }]);
    if (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message);
      return;
    }
    setScrimNameInput(''); setScrimKillPts(0); setScrimPlacePts(0); setScrimMatchesInput(5);
    alert('บันทึกคะแนนห้องซ้อมสำเร็จ');
    fetchAllData();
  }

  async function handleAddTourneyScore(teamId: string) {
    if (!requireAdmin()) return;
    if (!tourneyNameInput.trim()) return alert('กรุณากรอกชื่อทัวร์นาเมนต์');
    const { error } = await supabase.from('tournament_scores').insert([{
      tournament_name: tourneyNameInput.trim(),
      team_id: teamId,
      kill_points: Number(tourneyKillPts) || 0,
      placement_points: Number(tourneyPlacePts) || 0,
      matches: Number(tourneyMatchesInput) || 5
    }]);
    if (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message);
      return;
    }
    setTourneyNameInput(''); setTourneyKillPts(0); setTourneyPlacePts(0); setTourneyMatchesInput(5);
    alert('บันทึกคะแนนทัวร์นาเมนต์สำเร็จ');
    fetchAllData();
  }

  const teamsWithScores = teams.map(team => {
    const teamTourneyScores = allScores.filter(s => String(s.team_id) === String(team.id));
    const teamScrimScores = allScrimScores.filter(s => String(s.team_id) === String(team.id));

    const totalTourneyPts = teamTourneyScores.reduce((sum, s) => sum + (s.kill_points || 0) + (s.placement_points || 0), 0);
    const totalScrimPts = teamScrimScores.reduce((sum, s) => sum + (s.kill_points || 0) + (s.placement_points || 0), 0);

    const totalScrimKillPts = teamScrimScores.reduce((sum, s) => sum + (s.kill_points || 0), 0);
    const totalScrimPlacePts = teamScrimScores.reduce((sum, s) => sum + (s.placement_points || 0), 0);

    const totalTourneyKillPts = teamTourneyScores.reduce((sum, s) => sum + (s.kill_points || 0), 0);
    const totalTourneyPlacePts = teamTourneyScores.reduce((sum, s) => sum + (s.placement_points || 0), 0);

    const totalScrimMatches = teamScrimScores.reduce((sum, s) => sum + (Number(s.matches) || 5), 0);
    const totalTourneyMatches = teamTourneyScores.reduce((sum, s) => sum + (Number(s.matches) || 5), 0);

    const avgScrimPts = totalScrimMatches > 0 ? (totalScrimPts / totalScrimMatches).toFixed(2) : '0.00';
    const avgTourneyPts = totalTourneyMatches > 0 ? (totalTourneyPts / totalTourneyMatches).toFixed(2) : '0.00';

    const sortedRoster = players
      .filter(p => String(p.team_id) === String(team.id))
      .sort((a, b) => (b.total_kills || 0) - (a.total_kills || 0));

    return {
      ...team,
      totalTourneyPts,
      totalScrimPts,
      totalScrimKillPts,
      totalScrimPlacePts,
      totalTourneyKillPts,
      totalTourneyPlacePts,
      totalScrimMatches,
      totalTourneyMatches,
      avgScrimPts,
      avgTourneyPts,
      roster: sortedRoster,
      scrimHistory: teamScrimScores,
      tourneyHistory: teamTourneyScores
    };
  });

  const filteredTeams = teamsWithScores.filter(t => {
    if (!teamSearchQuery.trim()) return true;
    return t.name.toLowerCase().includes(teamSearchQuery.toLowerCase().trim()) || t.tag.toLowerCase().includes(teamSearchQuery.toLowerCase().trim());
  });

  const rankedTeams = [...filteredTeams].sort((a, b) => a.name.localeCompare(b.name));

  const renderRadarChart = (matches: number, kills: number, assists: number, damage: number, survived: number, rescue: number) => {
    const m = matches > 1 ? matches : 1;
    const pK = Math.min(Math.max(((kills / m) / 4) * 100, 10), 100);
    const pA = Math.min(Math.max(((assists / m) / 3) * 100, 10), 100);
    const pD = Math.min(Math.max(((damage / m) / 700) * 100, 10), 100);
    const pS = Math.min(Math.max(((survived / m) / 22) * 100, 10), 100);
    const pR = Math.min(Math.max(((rescue / m) / 4) * 100, 10), 100);

    const size = 180; const center = size / 2; const radius = 65;
    const getCoordinates = (value: number, index: number) => {
      const angle = (Math.PI * 2 / 5) * index - Math.PI / 2;
      const r = (radius * value) / 100;
      return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) };
    };
    const pts = [getCoordinates(pK, 0), getCoordinates(pA, 1), getCoordinates(pD, 2), getCoordinates(pR, 3), getCoordinates(pS, 4)];
    const ptsStr = pts.map(p => `${p.x},${p.y}`).join(' ');

    return (
      <div className="flex flex-col items-center justify-center my-2">
        <svg width={size} height={size} className="overflow-visible">
          {[0.2, 0.4, 0.6, 0.8, 1].map((lvl, idx) => {
            const lvlPts = [0,1,2,3,4].map(i => {
              const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
              const r = radius * lvl;
              return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
            }).join(' ');
            return <polygon key={idx} points={lvlPts} fill="none" stroke="#27272a" strokeWidth="1" />;
          })}
          {[0,1,2,3,4].map(i => {
            const pt = getCoordinates(100, i);
            return <line key={i} x1={center} y1={center} x2={pt.x} y2={pt.y} stroke="#3f3f46" strokeWidth="1" />;
          })}
          <polygon points={ptsStr} fill="rgba(56, 189, 248, 0.35)" stroke="#38bdf8" strokeWidth="2" />
          {pts.map((pt, i) => <circle key={i} cx={pt.x} cy={pt.y} r="3" fill="#38bdf8" />)}
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
              className="bg-emerald-500/20 hover:bg-red-500/20 border border-emerald-500/40 hover:border-red-500/40 text-emerald-400 hover:text-red-400 text-[9px] px-2.5 py-1 rounded font-bold transition cursor-pointer"
            >
              แอดมิน (คลิกออก)
            </button>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="bg-zinc-900 hover:bg-zinc-800 text-sky-400 border border-sky-500/30 text-[9px] px-2.5 py-1 rounded font-bold transition"
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
                <button type="submit" className="flex-1 bg-sky-500 hover:bg-sky-400 text-black font-bold py-2 rounded-xl text-xs transition">ยืนยัน</button>
                <button type="button" onClick={() => setShowLoginModal(false)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-2 rounded-xl text-xs transition">ยกเลิก</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <main className="space-y-3">
        {isAdmin && (
          <div className="bg-zinc-900/80 border border-sky-500/30 p-3 rounded-xl space-y-2 mb-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-sky-400">จัดการข้อมูลกลาง</h3>
              <button onClick={() => setShowPlayerForm(!showPlayerForm)} className="text-[10px] bg-sky-500 text-black font-bold px-2 py-0.5 rounded">
                {showPlayerForm ? 'ปิดฟอร์ม' : '+ เพิ่ม Player กลาง'}
              </button>
            </div>

            {showPlayerForm && (
              <form onSubmit={handleAddPlayer} className="bg-black p-2.5 rounded-lg border border-zinc-800 space-y-2 text-xs mt-2">
                <input type="text" placeholder="ชื่อ IGN" value={ign} onChange={e => setIgn(e.target.value)} className="w-full bg-zinc-900 p-1.5 rounded text-white border border-zinc-800 text-[11px]" />
                <div className="space-y-1">
                  <div className="flex gap-1">
                    <input type="text" placeholder="รูปผู้เล่น (URL หรืออัปโหลด)" value={playerAvatarUrl} onChange={e => setPlayerAvatarUrl(e.target.value)} className="flex-1 bg-zinc-900 p-1.5 rounded text-white border border-zinc-800 text-[11px]" />
                    <label className="bg-zinc-800 hover:bg-zinc-700 text-sky-400 font-bold px-2 py-1 rounded text-[10px] cursor-pointer flex items-center justify-center border border-sky-500/30">
                      อัปโหลด
                      <input type="file" accept="image/*" onChange={(e) => handleDirectImageUpload(e, setPlayerAvatarUrl)} className="hidden" />
                    </label>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <select value={role} onChange={e => setRole(e.target.value)} className="w-full bg-zinc-900 p-1.5 rounded text-white border border-zinc-800 text-[11px]">
                    <option value="ATK 1">ATK 1</option><option value="ATK 2">ATK 2</option><option value="IGL">IGL</option><option value="Co-iGL">Co-iGL</option><option value="Scout">Scout</option><option value="Flex">Flex</option>
                  </select>
                  <select value={playerTeamId} onChange={e => setPlayerTeamId(e.target.value)} className="w-full bg-zinc-900 p-1.5 rounded text-white border border-zinc-800 text-[11px]">
                    <option value="">-- Free Agent (LFT) --</option>
                    {teams.map(t => <option key={t.id} value={t.id}>[{t.tag}] {t.name}</option>)}
                  </select>
                </div>
                <button type="submit" className="w-full bg-sky-500 text-black font-bold py-1 rounded">บันทึก Player</button>
              </form>
            )}
          </div>
        )}

        <div className="flex justify-between items-center">
          <h2 className="text-xs font-bold text-zinc-300">รายชื่อทีมทั้งหมด ({teams.length} ทีม)</h2>
          {isAdmin && teams.length < 20 && (
            <button onClick={() => setShowTeamForm(!showTeamForm)} className="text-xs bg-sky-500 text-black font-bold px-2.5 py-1 rounded">
              {showTeamForm ? 'ปิด' : '+ เพิ่ม Team'}
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
                  <input type="file" accept="image/*" onChange={(e) => handleDirectImageUpload(e, setTeamLogoUrl)} className="hidden" />
                </label>
              </div>
            </div>

            <button type="submit" className="w-full bg-sky-500 text-black font-bold py-1.5 rounded">บันทึก Team</button>
          </form>
        )}

        <input
          type="text"
          placeholder="ค้นหาชื่อทีมหรือ TAG..."
          value={teamSearchQuery}
          onChange={(e) => setTeamSearchQuery(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500 transition"
        />

        <div className="space-y-5">
          {rankedTeams.length === 0 ? (
            <div className="bg-zinc-900/40 p-10 rounded-3xl border border-zinc-800 text-center text-xs text-zinc-400">ไม่พบข้อมูล Team</div>
          ) : (
            rankedTeams.map((t) => (
              <div 
                key={t.id} 
                onClick={() => { setSelectedTeam(t); setTeamModalDetailTab('roster'); }} 
                className="p-7 rounded-3xl border-2 border-zinc-800 relative overflow-hidden cursor-pointer transition shadow-2xl group hover:border-sky-500 bg-zinc-950"
              >
                {t.logo_url && (
                  <div 
                    className="absolute inset-0 bg-no-repeat bg-right bg-cover opacity-35 pointer-events-none filter blur-[1px] scale-125 transition duration-500 group-hover:scale-140" 
                    style={{ backgroundImage: `url(${t.logo_url})` }}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/20 pointer-events-none" />

                <div className="relative z-10 flex items-center justify-between py-2 gap-4">
                  <div className="flex items-center gap-6 min-w-0 flex-1">
                    {t.logo_url ? (
                      <img src={t.logo_url} alt={t.name} onClick={(e) => { e.stopPropagation(); setPreviewImage({ url: t.logo_url, title: `[${t.tag}] ${t.name}` }); }} className="w-24 h-24 object-contain rounded-2xl bg-zinc-950/80 p-2 border-2 border-zinc-700/80 shrink-0 group-hover:scale-110 transition cursor-pointer shadow-2xl" />
                    ) : (
                      <div className="w-24 h-24 rounded-2xl bg-zinc-950 border-2 border-zinc-800 flex items-center justify-center text-xs text-zinc-500 shrink-0">ไม่มีโลโก้</div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-black bg-sky-500/30 text-sky-300 px-3 py-1 rounded-xl border border-sky-500/50 shadow inline-block">[{t.tag}]</span>
                      </div>
                      <h3 className="font-black text-2xl text-white group-hover:text-sky-400 transition drop-shadow-xl truncate">{t.name}</h3>
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="shrink-0">
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteTeam(t.id, t.name); }} className="text-xs bg-red-500/20 text-red-400 p-3.5 rounded-xl border border-red-500/30 hover:bg-red-500/30 shadow-lg">ลบ</button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* ================= MODAL: TEAM DETAILS ================= */}
      {selectedTeam && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 text-xs">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-sm rounded-xl p-4 space-y-3 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
              <div className="flex items-center gap-3">
                {selectedTeam.logo_url && (
                  <img src={selectedTeam.logo_url} alt={selectedTeam.name} onClick={() => setPreviewImage({ url: selectedTeam.logo_url, title: `[${selectedTeam.tag}] ${selectedTeam.name}` })} className="w-12 h-12 object-contain rounded-lg bg-zinc-950 p-0.5 border border-zinc-800 cursor-pointer" />
                )}
                <div>
                  <h3 className="font-black text-sky-400 text-lg leading-tight">[{selectedTeam.tag}] {selectedTeam.name}</h3>
                </div>
              </div>
              <button onClick={() => setSelectedTeam(null)} className="text-zinc-400 hover:text-white font-bold text-base">✕</button>
            </div>

            <div className="grid grid-cols-4 gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-[10px]">
              <button onClick={() => setTeamModalDetailTab('roster')} className={`py-1.5 font-bold rounded transition ${teamModalDetailTab === 'roster' ? 'bg-sky-500 text-black' : 'text-zinc-400'}`}>ผู้เล่น ({selectedTeam.roster.length})</button>
              <button onClick={() => setTeamModalDetailTab('overview')} className={`py-1.5 font-bold rounded transition ${teamModalDetailTab === 'overview' ? 'bg-sky-500 text-black' : 'text-zinc-400'}`}>สรุป</button>
              <button onClick={() => setTeamModalDetailTab('scrims')} className={`py-1.5 font-bold rounded transition ${teamModalDetailTab === 'scrims' ? 'bg-sky-500 text-black' : 'text-zinc-400'}`}>ประวัติซ้อม</button>
              <button onClick={() => setTeamModalDetailTab('tournaments')} className={`py-1.5 font-bold rounded transition ${teamModalDetailTab === 'tournaments' ? 'bg-sky-500 text-black' : 'text-zinc-400'}`}>ประวัติทัวร์</button>
            </div>

            {teamModalDetailTab === 'overview' && (
              <div className="space-y-3 pt-1">
                <div className="bg-black p-3 rounded-xl border border-zinc-800 space-y-3">
                  <p className="text-zinc-300 font-bold">สรุปคะแนน (แยกประเภท, แต้มคิล, แต้มอันดับ และจำนวนเกม):</p>
                  
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-900 space-y-1.5">
                      <span className="text-[10px] text-sky-400 font-bold block">ห้องซ้อมรวม</span>
                      <div className="text-base font-black text-white">{selectedTeam.totalScrimPts} แต้ม</div>
                      <div className="grid grid-cols-2 gap-1 text-[9px] bg-black p-1.5 rounded border border-zinc-900">
                        <div>
                          <span className="text-zinc-400 block">คิลรวม</span>
                          <strong className="text-sky-400">{selectedTeam.totalScrimKillPts}</strong>
                        </div>
                        <div>
                          <span className="text-zinc-400 block">อันดับรวม</span>
                          <strong className="text-white">{selectedTeam.totalScrimPlacePts}</strong>
                        </div>
                      </div>
                      <div className="text-[9px] text-zinc-400">จำนวนเกม: <strong className="text-white">{selectedTeam.totalScrimMatches} เกม</strong></div>
                      <div className="border-t border-zinc-900 pt-1">
                        <span className="text-[8px] text-zinc-500 block">เฉลี่ยต่อเกม (AVG)</span>
                        <strong className="text-sm text-emerald-400">{selectedTeam.avgScrimPts}</strong>
                      </div>
                    </div>

                    <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-900 space-y-1.5">
                      <span className="text-[10px] text-amber-300 font-bold block">ทัวร์นาเมนต์รวม</span>
                      <div className="text-base font-black text-white">{selectedTeam.totalTourneyPts} แต้ม</div>
                      <div className="grid grid-cols-2 gap-1 text-[9px] bg-black p-1.5 rounded border border-zinc-900">
                        <div>
                          <span className="text-zinc-400 block">คิลรวม</span>
                          <strong className="text-amber-300">{selectedTeam.totalTourneyKillPts}</strong>
                        </div>
                        <div>
                          <span className="text-zinc-400 block">อันดับรวม</span>
                          <strong className="text-white">{selectedTeam.totalTourneyPlacePts}</strong>
                        </div>
                      </div>
                      <div className="text-[9px] text-zinc-400">จำนวนเกม: <strong className="text-white">{selectedTeam.totalTourneyMatches} เกม</strong></div>
                      <div className="border-t border-zinc-900 pt-1">
                        <span className="text-[8px] text-zinc-500 block">เฉลี่ยต่อเกม (AVG)</span>
                        <strong className="text-sm text-amber-400">{selectedTeam.avgTourneyPts}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {teamModalDetailTab === 'scrims' && (
              <div className="space-y-3 pt-1">
                {isAdmin && (
                  <div className="bg-black p-2.5 rounded-lg border border-sky-500/40 space-y-2">
                    <p className="text-[10px] text-sky-400 font-bold">เพิ่มคะแนนห้องซ้อมให้ทีมนี้</p>
                    <input 
                      type="text" 
                      placeholder="พิมพ์ชื่อห้องซ้อม (เช่น Room วันนี้ Match 1)" 
                      value={scrimNameInput} 
                      onChange={e => setScrimNameInput(e.target.value)} 
                      className="w-full bg-zinc-900 p-1.5 rounded text-white border border-zinc-800 text-[10px]" 
                    />
                    <div className="grid grid-cols-3 gap-1.5">
                      <div>
                        <span className="text-[9px] text-zinc-400 block">แต้มคิล</span>
                        <input type="number" value={scrimKillPts} onChange={e => setScrimKillPts(Number(e.target.value))} className="w-full bg-zinc-900 p-1 rounded text-white border border-zinc-800 text-center text-[10px]" />
                      </div>
                      <div>
                        <span className="text-[9px] text-zinc-400 block">แต้มอันดับ</span>
                        <input type="number" value={scrimPlacePts} onChange={e => setScrimPlacePts(Number(e.target.value))} className="w-full bg-zinc-900 p-1 rounded text-white border border-zinc-800 text-center text-[10px]" />
                      </div>
                      <div>
                        <span className="text-[9px] text-zinc-400 block">จำนวนเกม</span>
                        <input type="number" min="1" value={scrimMatchesInput} onChange={e => setScrimMatchesInput(Number(e.target.value))} className="w-full bg-zinc-900 p-1 rounded text-white border border-zinc-800 text-center text-[10px]" />
                      </div>
                    </div>
                    <button onClick={() => handleAddScrimScore(selectedTeam.id)} className="w-full bg-sky-500 hover:bg-sky-400 text-black font-bold py-1 rounded text-[10px]">บันทึกคะแนนซ้อม</button>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <p className="text-sky-400 font-bold">ประวัติการลงห้องซ้อม:</p>
                  <span className="text-[11px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded font-bold border border-sky-500/30">
                    บันทึกแล้ว: {selectedTeam.scrimHistory.length} ครั้ง
                  </span>
                </div>

                {selectedTeam.scrimHistory.length === 0 ? (
                  <p className="text-zinc-500 italic text-center py-4">ยังไม่มีประวัติห้องซ้อม</p>
                ) : (
                  selectedTeam.scrimHistory.map((s: any, index: number) => {
                    const sessionHistories = allScoreHistory.filter(h => String(h.scrim_session_id) === String(s.id));
                    const uniqueGamesCount = new Set(sessionHistories.map(h => h.game_no)).size;
                    const matchesCount = Number(s.matches) || 5;
                    const totalPts = (s.kill_points || 0) + (s.placement_points || 0);
                    const avgPerMatch = (totalPts / matchesCount).toFixed(2);

                    return (
                      <div 
                        key={s.id} 
                        className="bg-black p-3 rounded-xl border border-zinc-800 hover:border-sky-500 space-y-2 text-[10px] transition shadow"
                      >
                        <div 
                          onClick={() => { setActiveHistoryScrim(s); setShowHistoryModal(true); }}
                          className="flex justify-between items-center cursor-pointer"
                        >
                          <span className="text-white font-bold flex items-center gap-1.5 text-xs">
                            #{index + 1} {s.scrim_name || 'ห้องซ้อม'}
                          </span>
                          <span className="font-black text-sky-400">{totalPts} แต้ม (AVG: {avgPerMatch})</span>
                        </div>
                        <div className="flex justify-between items-center pt-1 border-t border-zinc-900 text-[9px] text-zinc-400">
                          <span onClick={() => { setActiveHistoryScrim(s); setShowHistoryModal(true); }} className="cursor-pointer">
                            คิล: <strong className="text-sky-400">{s.kill_points || 0}</strong> | อันดับ: <strong className="text-white">{s.placement_points || 0}</strong> | เกม: <strong className="text-white">{matchesCount}</strong>
                          </span>
                          <div className="flex items-center gap-2">
                            <span onClick={() => { setActiveHistoryScrim(s); setShowHistoryModal(true); }} className="cursor-pointer">
                              กรอกผู้เล่น: <strong className={uniqueGamesCount >= 6 ? 'text-red-400' : 'text-emerald-400'}>{uniqueGamesCount}/6 ครั้ง</strong>
                            </span>
                            {isAdmin && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleDeleteScrimScore(s.id, s.scrim_name); }} 
                                className="bg-red-500/20 text-red-400 hover:bg-red-500/30 px-2 py-0.5 rounded border border-red-500/30 font-bold"
                              >
                                ลบ
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {teamModalDetailTab === 'tournaments' && (
              <div className="space-y-3 pt-1">
                {isAdmin && (
                  <div className="bg-black p-2.5 rounded-lg border border-amber-500/40 space-y-2">
                    <p className="text-[10px] text-amber-300 font-bold">เพิ่มคะแนนทัวร์นาเมนต์ให้ทีมนี้</p>
                    <input 
                      type="text" 
                      placeholder="พิมพ์ชื่อทัวร์นาเมนต์ (เช่น Pro League Final)" 
                      value={tourneyNameInput} 
                      onChange={e => setTourneyNameInput(e.target.value)} 
                      className="w-full bg-zinc-900 p-1.5 rounded text-white border border-zinc-800 text-[10px]" 
                    />
                    <div className="grid grid-cols-3 gap-1.5">
                      <div>
                        <span className="text-[9px] text-zinc-400 block">แต้มคิล</span>
                        <input type="number" value={tourneyKillPts} onChange={e => setTourneyKillPts(Number(e.target.value))} className="w-full bg-zinc-900 p-1 rounded text-white border border-zinc-800 text-center text-[10px]" />
                      </div>
                      <div>
                        <span className="text-[9px] text-zinc-400 block">แต้มอันดับ</span>
                        <input type="number" value={tourneyPlacePts} onChange={e => setTourneyPlacePts(Number(e.target.value))} className="w-full bg-zinc-900 p-1 rounded text-white border border-zinc-800 text-center text-[10px]" />
                      </div>
                      <div>
                        <span className="text-[9px] text-zinc-400 block">จำนวนเกม</span>
                        <input type="number" min="1" value={tourneyMatchesInput} onChange={e => setTourneyMatchesInput(Number(e.target.value))} className="w-full bg-zinc-900 p-1 rounded text-white border border-zinc-800 text-center text-[10px]" />
                      </div>
                    </div>
                    <button onClick={() => handleAddTourneyScore(selectedTeam.id)} className="w-full bg-amber-400 hover:bg-amber-300 text-black font-bold py-1 rounded text-[10px]">บันทึกคะแนนทัวร์</button>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <p className="text-amber-300 font-bold">ประวัติการลงทัวร์นาเมนต์:</p>
                  <span className="text-[11px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold border border-amber-500/30">
                    บันทึกแล้ว: {selectedTeam.tourneyHistory.length} ครั้ง
                  </span>
                </div>

                {selectedTeam.tourneyHistory.length === 0 ? (
                  <p className="text-zinc-500 italic text-center py-4">ยังไม่มีประวัติทัวร์นาเมนต์</p>
                ) : (
                  selectedTeam.tourneyHistory.map((t: any, index: number) => {
                    const matchesCount = Number(t.matches) || 5;
                    const totalPts = (t.kill_points || 0) + (t.placement_points || 0);
                    const avgPerMatch = (totalPts / matchesCount).toFixed(2);

                    return (
                      <div key={t.id} className="bg-black p-2.5 rounded-xl border border-zinc-800 flex justify-between items-center text-[10px]">
                        <div>
                          <span className="text-zinc-300 block font-bold">#{index + 1} {t.tournament_name || 'ทัวร์นาเมนต์'}</span>
                          <span className="text-[9px] text-zinc-400">คิล: <strong className="text-amber-300">{t.kill_points || 0}</strong> | อันดับ: <strong className="text-white">{t.placement_points || 0}</strong> | เกม: <strong className="text-white">{matchesCount}</strong></span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="font-black text-amber-300 text-xs block">{totalPts} แต้ม</span>
                            <span className="text-[9px] text-zinc-400">AVG: <strong className="text-amber-400">{avgPerMatch}</strong></span>
                          </div>
                          {isAdmin && (
                            <button 
                              onClick={() => handleDeleteTourneyScore(t.id, t.tournament_name)} 
                              className="bg-red-500/20 text-red-400 hover:bg-red-500/30 px-2 py-1 rounded border border-red-500/30 font-bold"
                            >
                              ลบ
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {teamModalDetailTab === 'roster' && (
              <div className="space-y-3 pt-1">
                {/* 🌟 ส่วนแสดง Top Players ประจำทีม (เฉพาะทีมนี้) */}
                <div className="bg-black p-2.5 rounded-xl border border-sky-500/30 space-y-2">
                  <h4 className="text-[11px] font-bold text-sky-400 flex items-center justify-between">
                    <span>🏆 Top Players ประจำทีม</span>
                    <span className="text-[9px] text-zinc-400">เรียงตามคิลสูงสุด</span>
                  </h4>
                  <div className="space-y-1.5">
                    {selectedTeam.roster.length === 0 ? (
                      <p className="text-[10px] text-zinc-500 italic text-center py-2">ยังไม่มีผู้เล่นในทีม</p>
                    ) : (
                      selectedTeam.roster.slice(0, 5).map((p: any, idx: number) => (
                        <div key={p.id} onClick={() => setSelectedPlayer(p)} className="bg-zinc-950 p-2 rounded-lg border border-zinc-900 flex justify-between items-center cursor-pointer hover:border-sky-500 transition">
                          <div className="flex items-center gap-2">
                            <span className={`w-4 h-4 rounded flex items-center justify-center text-[9px] font-black ${idx === 0 ? 'bg-red-500 text-white' : idx === 1 ? 'bg-orange-500 text-white' : idx === 2 ? 'bg-yellow-500 text-black' : 'bg-zinc-800 text-zinc-400'}`}>{idx + 1}</span>
                            {p.avatar_url && <img src={p.avatar_url} alt={p.ign} className="w-5 h-5 object-cover rounded bg-zinc-950" />}
                            <span className="text-white font-bold text-[11px]">{p.ign}</span>
                            <span className="text-[8px] text-sky-400 bg-zinc-900 px-1 py-0.5 rounded">{p.role}</span>
                          </div>
                          <span className="text-[10px] font-black text-sky-400">{p.total_kills || 0} Kills</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-1">
                  <p className="text-zinc-300 font-bold">รายชื่อผู้เล่นทั้งหมดในทีม ({selectedTeam.roster.length}):</p>
                  {isAdmin && selectedTeam.scrimHistory.length > 0 && selectedTeam.roster.length > 0 && (
                    <button 
                      onClick={() => {
                        setSelectedScrimSessionId(selectedTeam.scrimHistory[selectedTeam.scrimHistory.length - 1]?.id || '');
                        setShowBatchScoreModal(true);
                      }} 
                      className="bg-sky-500 text-black text-[10px] font-bold px-2 py-1 rounded shadow"
                    >
                      กรอกคะแนนผู้เล่นทั้งทีม (6 เกม)
                    </button>
                  )}
                </div>

                {isAdmin && (
                  <div className="bg-black p-2.5 rounded-lg border border-zinc-800 space-y-1.5 mb-2">
                    <label className="text-[9px] text-sky-400 font-bold block">เพิ่ม Player ใหม่เข้า Team นี้</label>
                    <input type="text" placeholder="ชื่อ IGN" value={newTeamPlayerIgn} onChange={e => setNewTeamPlayerIgn(e.target.value)} className="w-full bg-zinc-900 p-1.5 rounded text-white border border-zinc-800 text-[10px]" />
                    
                    <div className="space-y-1">
                      <div className="flex gap-1">
                        <input type="text" placeholder="รูปผู้เล่น (URL หรืออัปโหลด)" value={newTeamPlayerAvatar} onChange={e => setNewTeamPlayerAvatar(e.target.value)} className="flex-1 bg-zinc-900 p-1.5 rounded text-white border border-zinc-800 text-[10px]" />
                        <label className="bg-zinc-800 hover:bg-zinc-700 text-sky-400 font-bold px-2 py-1 rounded text-[10px] cursor-pointer flex items-center justify-center border border-sky-500/30">
                          อัปโหลด
                          <input type="file" accept="image/*" onChange={(e) => handleDirectImageUpload(e, setNewTeamPlayerAvatar)} className="hidden" />
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-1">
                      <select value={newTeamPlayerRole} onChange={e => setNewTeamPlayerRole(e.target.value)} className="w-full bg-zinc-900 p-1 rounded text-white border border-zinc-800 text-[10px]">
                        <option value="ATK 1">ATK 1</option><option value="ATK 2">ATK 2</option><option value="IGL">IGL</option><option value="Co-iGL">Co-iGL</option><option value="Scout">Scout</option><option value="Flex">Flex</option>
                      </select>
                      <select value={newTeamPlayerSubRole} onChange={e => setNewTeamPlayerSubRole(e.target.value)} className="w-full bg-zinc-900 p-1 rounded text-white border border-zinc-800 text-[10px]">
                        <option value="">-- รอง --</option><option value="ATK 1">ATK 1</option><option value="ATK 2">ATK 2</option><option value="IGL">IGL</option><option value="Co-iGL">Co-iGL</option><option value="Scout">Scout</option><option value="Flex">Flex</option>
                      </select>
                    </div>
                    <button onClick={() => handleCreatePlayerForTeam(selectedTeam.id)} className="w-full bg-sky-500/25 border border-sky-500/40 text-sky-300 font-bold py-1 rounded">+ บันทึกผู้เล่นเข้าทีม</button>
                  </div>
                )}

                {selectedTeam.scrimHistory.length === 0 && isAdmin && (
                  <p className="text-[10px] text-amber-300 bg-amber-500/10 p-2 rounded border border-amber-500/30 text-center">
                    ต้องบันทึกคะแนนห้องซ้อมอย่างน้อย 1 ครั้งก่อน จึงจะสามารถกรอกคะแนนผู้เล่นได้
                  </p>
                )}

                {selectedTeam.roster.length === 0 ? (
                  <p className="text-zinc-500 italic text-center py-2">ยังไม่มี Player ใน Team นี้</p>
                ) : (
                  selectedTeam.roster.map((p: any) => {
                    return (
                      <div 
                        key={p.id} 
                        className="bg-black p-3 rounded-xl border border-zinc-800 flex justify-between items-center cursor-pointer hover:border-sky-500 transition" 
                        onClick={() => setSelectedPlayer(p)}
                      >
                        <div className="flex items-center gap-3">
                          {p.avatar_url && <img src={p.avatar_url} alt={p.ign} className="w-9 h-9 object-cover rounded-lg bg-zinc-950 border border-zinc-800" />}
                          <div>
                            <span className="text-white font-black text-sm flex items-center gap-1">
                              {p.ign}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                          <span className="text-xs text-sky-400 font-extrabold bg-sky-500/10 px-2.5 py-1 rounded-lg border border-sky-500/30">
                            {p.role}
                          </span>
                          {isAdmin && (
                            <button onClick={() => handleDeletePlayerCompletely(p.id, p.ign)} className="text-[10px] bg-red-500/10 text-red-400 px-2 py-1 rounded border border-red-500/20 hover:bg-red-500/30">ลบ</button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            <button onClick={() => setSelectedTeam(null)} className="w-full bg-zinc-800 text-white py-2 rounded font-bold mt-2">ปิดหน้าต่าง</button>
          </div>
        </div>
      )}

      {/* ================= MODAL: HISTORY AUDIT LOG ================= */}
      {showHistoryModal && activeHistoryScrim && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 text-xs">
          <div className="bg-zinc-900 border border-sky-500/50 w-full max-w-md rounded-2xl p-4 space-y-3 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
              <div>
                <h3 className="font-bold text-sky-400 text-sm">ผลงานผู้เล่นรอบ: {activeHistoryScrim.scrim_name}</h3>
                <p className="text-[10px] text-zinc-400">แต้มห้องซ้อมนี้: คิล {activeHistoryScrim.kill_points} | อันดับ {activeHistoryScrim.placement_points}</p>
              </div>
              <button onClick={() => setShowHistoryModal(false)} className="text-zinc-400 hover:text-white font-bold text-base">✕</button>
            </div>

            {(() => {
              const logs = allScoreHistory.filter(h => String(h.scrim_session_id) === String(activeHistoryScrim.id));
              if (logs.length === 0) {
                return <p className="text-zinc-500 italic text-center py-6">ยังไม่มีการบันทึกสถิติผู้เล่นในรอบนี้</p>;
              }

              const groupedByGame: { [gameNo: number]: any[] } = {};
              logs.forEach(l => {
                const gNo = Number(l.game_no) || 1;
                if (!groupedByGame[gNo]) groupedByGame[gNo] = [];
                groupedByGame[gNo].push(l);
              });

              return (
                <div className="space-y-4">
                  {Object.entries(groupedByGame).map(([gameNo, playerLogs]) => (
                    <div key={gameNo} className="bg-black p-3 rounded-xl border border-zinc-800 space-y-2">
                      <div className="flex justify-between items-center border-b border-zinc-900 pb-1 text-[10px]">
                        <span className="text-sky-400 font-bold">เกมที่ {gameNo}</span>
                      </div>
                      <div className="space-y-1.5 pt-1">
                        {playerLogs.map((pl: any) => (
                          <div key={pl.id} className="bg-zinc-950 p-2 rounded-lg border border-zinc-900 flex justify-between items-center text-[10px]">
                            <div>
                              <strong className="text-white text-xs">{pl.ign}</strong>
                            </div>
                            <div className="text-right space-x-2">
                              <span>คิล: <strong className="text-sky-400">{pl.kills}</strong></span>
                              <span>แอส: <strong className="text-white">{pl.assists}</strong></span>
                              <span>ดาเมจ: <strong className="text-white">{pl.damage}</strong></span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}

            <button onClick={() => setShowHistoryModal(false)} className="w-full bg-zinc-800 text-white py-2 rounded-xl font-bold mt-2">ปิดหน้าต่าง</button>
          </div>
        </div>
      )}

      {/* ================= MODAL: BATCH PLAYER SCORES (6 เกมรวด) ================= */}
      {showBatchScoreModal && selectedTeam && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 text-xs">
          <div className="bg-zinc-900 border border-sky-500/50 w-full max-w-lg rounded-2xl p-4 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
              <h3 className="font-bold text-sky-400 text-sm">กรอกคะแนนผู้เล่น 6 เกม (รายคน): [{selectedTeam.tag}]</h3>
              <button onClick={() => setShowBatchScoreModal(false)} className="text-zinc-400 hover:text-white font-bold text-base">✕</button>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-zinc-300 font-bold block">เลือกห้องซ้อม / แมตช์ที่ต้องการอ้างอิง:</label>
              <select 
                value={selectedScrimSessionId} 
                onChange={(e) => setSelectedScrimSessionId(e.target.value)} 
                className="w-full bg-black border border-zinc-700 p-2 rounded-xl text-xs text-white"
              >
                {selectedTeam.scrimHistory.map((s: any, idx: number) => (
                  <option key={s.id} value={s.id}>
                    #{idx + 1} - {s.scrim_name}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-zinc-500 italic">* คนไหนไม่ได้ลงแข่งในเกมไหน ให้เว้นช่องว่างไว้ จำนวนเกมจะไม่ถูกนับเพิ่ม</p>
            </div>

            <div className="space-y-4 pt-2">
              {[...selectedTeam.roster].sort((a: any, b: any) => a.ign.localeCompare(b.ign, 'en', { sensitivity: 'accent' })).map((player: any) => {
                const playerGames = batchPlayerScores[player.id] || {};
                return (
                  <div key={player.id} className="bg-black p-3 rounded-xl border border-zinc-800 space-y-3">
                    <div className="flex items-center gap-2 border-b border-zinc-900 pb-2">
                      {player.avatar_url && <img src={player.avatar_url} alt={player.ign} className="w-6 h-6 object-cover rounded bg-zinc-950" />}
                      <span className="font-bold text-white text-xs">{player.ign}</span>
                      <span className="text-[9px] text-sky-400 bg-zinc-900 px-1.5 py-0.5 rounded ml-auto">{player.role}</span>
                    </div>

                    <div className="space-y-2">
                      {[1, 2, 3, 4, 5, 6].map((gNo) => {
                        const gStats = playerGames[gNo] || { kills: '', assists: '', damage: '', survived: '', rescue: '' };
                        return (
                          <div key={gNo} className="bg-zinc-950 p-2 rounded-lg border border-zinc-900 flex items-center justify-between gap-2 text-[10px]">
                            <span className="text-sky-400 font-bold shrink-0 w-12">เกม {gNo}</span>
                            <div className="grid grid-cols-5 gap-1 flex-1">
                              <input 
                                type="number" 
                                placeholder="คิล" 
                                value={gStats.kills} 
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setBatchPlayerScores({
                                    ...batchPlayerScores,
                                    [player.id]: {
                                      ...playerGames,
                                      [gNo]: { ...gStats, kills: val === '' ? '' : Number(val) }
                                    }
                                  });
                                }} 
                                className="bg-zinc-900 p-1 rounded text-white border border-zinc-800 text-center font-bold text-sky-400 placeholder-zinc-600" 
                              />
                              <input 
                                type="number" 
                                placeholder="แอส" 
                                value={gStats.assists} 
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setBatchPlayerScores({
                                    ...batchPlayerScores,
                                    [player.id]: {
                                      ...playerGames,
                                      [gNo]: { ...gStats, assists: val === '' ? '' : Number(val) }
                                    }
                                  });
                                }} 
                                className="bg-zinc-900 p-1 rounded text-white border border-zinc-800 text-center placeholder-zinc-600" 
                              />
                              <input 
                                type="number" 
                                placeholder="ดาเมจ" 
                                value={gStats.damage} 
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setBatchPlayerScores({
                                    ...batchPlayerScores,
                                    [player.id]: {
                                      ...playerGames,
                                      [gNo]: { ...gStats, damage: val === '' ? '' : Number(val) }
                                    }
                                  });
                                }} 
                                className="bg-zinc-900 p-1 rounded text-white border border-zinc-800 text-center placeholder-zinc-600" 
                              />
                              <input 
                                type="number" 
                                placeholder="รอด" 
                                value={gStats.survived} 
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setBatchPlayerScores({
                                    ...batchPlayerScores,
                                    [player.id]: {
                                      ...playerGames,
                                      [gNo]: { ...gStats, survived: val === '' ? '' : Number(val) }
                                    }
                                  });
                                }} 
                                className="bg-zinc-900 p-1 rounded text-white border border-zinc-800 text-center placeholder-zinc-600" 
                              />
                              <input 
                                type="number" 
                                placeholder="ช่วย" 
                                value={gStats.rescue} 
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setBatchPlayerScores({
                                    ...batchPlayerScores,
                                    [player.id]: {
                                      ...playerGames,
                                      [gNo]: { ...gStats, rescue: val === '' ? '' : Number(val) }
                                    }
                                  });
                                }} 
                                className="bg-zinc-900 p-1 rounded text-white border border-zinc-800 text-center placeholder-zinc-600" 
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <button 
              onClick={() => handleSaveBatchPlayerScores(selectedTeam)} 
              className="w-full font-bold py-2.5 rounded-xl text-xs mt-2 transition shadow-lg bg-sky-500 hover:bg-sky-400 text-black"
            >
              บันทึกคะแนนผู้เล่นทั้ง 6 เกมทันที
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL: PLAYER PROFILE ================= */}
      {selectedPlayer && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 text-xs">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-sm rounded-xl p-4 space-y-3 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-4 border-b border-zinc-800 pb-3">
              {selectedPlayer.avatar_url && !imageHasError ? (
                <img src={selectedPlayer.avatar_url} alt={selectedPlayer.ign} onError={() => setImageHasError(true)} className="w-16 h-16 object-cover rounded-xl bg-zinc-950 border border-zinc-800 shrink-0" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-zinc-950 border border-zinc-800 shrink-0 flex items-center justify-center text-zinc-500 text-[9px]">ไม่มีรูป</div>
              )}
              <div className="flex flex-col">
                <h3 className="font-black text-white text-lg leading-tight">{selectedPlayer.ign}</h3>
                <span className="text-xs text-sky-400 font-semibold mt-1">{selectedPlayer.role}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
              <button onClick={() => setPlayerModalTab('scrims')} className={`py-1.5 font-bold rounded-lg transition text-[11px] ${playerModalTab === 'scrims' ? 'bg-sky-500 text-black shadow' : 'text-zinc-400'}`}>ห้องซ้อม</button>
              <button onClick={() => setPlayerModalTab('tournaments')} className={`py-1.5 font-bold rounded-lg transition ${playerModalTab === 'tournaments' ? 'bg-sky-500 text-black shadow' : 'text-zinc-400'}`}>ห้องแข่ง</button>
            </div>

            {playerModalTab === 'scrims' ? (
              <div className="bg-black p-3 rounded-xl border border-zinc-800 space-y-2">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-sky-400 font-bold">พลังแฝงห้องซ้อม (Scrims Radar)</span>
                  <span className="text-zinc-400">ลง: <strong className="text-white">{selectedPlayer.total_matches || 0} เกม</strong></span>
                </div>

                <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-900 text-center">
                  <span className="text-[9px] text-zinc-400 block mb-0.5">KDA (Scrims)</span>
                  <strong className="text-base text-amber-300 font-black">
                    {((((selectedPlayer.total_kills || 0) + (selectedPlayer.Assists || 0))) / (selectedPlayer.total_matches > 0 ? selectedPlayer.total_matches : 1)).toFixed(2)}
                  </strong>
                </div>

                {renderRadarChart(selectedPlayer.total_matches || 0, selectedPlayer.total_kills || 0, selectedPlayer.Assists || 0, selectedPlayer.Damage || 0, selectedPlayer.Survived || 0, selectedPlayer.Rescue || 0)}

                <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-900 space-y-2">
                  <span className="text-[10px] text-sky-400 font-bold block border-b border-zinc-900 pb-1">สถิติรวมห้องซ้อมทั้งหมด</span>
                  <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                    <div className="bg-black p-1.5 rounded border border-zinc-900">
                      <span className="text-zinc-400 block text-[9px]">คิลรวม</span>
                      <strong className="text-sky-400">{selectedPlayer.total_kills || 0}</strong>
                    </div>
                    <div className="bg-black p-1.5 rounded border border-zinc-900">
                      <span className="text-zinc-400 block text-[9px]">ดาเมจรวม</span>
                      <strong className="text-white">{selectedPlayer.Damage || 0}</strong>
                    </div>
                    <div className="bg-black p-1.5 rounded border border-zinc-900">
                      <span className="text-zinc-400 block text-[9px]">แอสซิสต์รวม</span>
                      <strong className="text-white">{selectedPlayer.Assists || 0}</strong>
                    </div>
                    <div className="bg-black p-1.5 rounded border border-zinc-900">
                      <span className="text-zinc-400 block text-[9px]">รอดชีวิตรวม</span>
                      <strong className="text-white">{selectedPlayer.Survived || 0}</strong>
                    </div>
                    <div className="bg-black p-1.5 rounded border border-zinc-900">
                      <span className="text-zinc-400 block text-[9px]">ช่วยเพื่อนรวม</span>
                      <strong className="text-white">{selectedPlayer.Rescue || 0}</strong>
                    </div>
                    <div className="bg-black p-1.5 rounded border border-zinc-900">
                      <span className="text-zinc-400 block text-[9px]">เกมรวม</span>
                      <strong className="text-white">{selectedPlayer.total_matches || 0}</strong>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-black p-3 rounded-xl border border-zinc-800 space-y-2">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-sky-300 font-bold">พลังแฝงห้องแข่ง (Tournament Radar)</span>
                  <span className="text-zinc-400">ลง: <strong className="text-white">{selectedPlayer.tourney_matches || 0} เกม</strong></span>
                </div>

                <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-900 text-center">
                  <span className="text-[9px] text-zinc-400 block mb-0.5">KDA (Tourney)</span>
                  <strong className="text-base text-amber-300 font-black">
                    {((((selectedPlayer.tourney_kills || 0) + (selectedPlayer.tourney_assists || 0))) / (selectedPlayer.tourney_matches > 0 ? selectedPlayer.tourney_matches : 1)).toFixed(2)}
                  </strong>
                </div>

                {renderRadarChart(selectedPlayer.tourney_matches || 0, selectedPlayer.tourney_kills || 0, selectedPlayer.tourney_assists || 0, selectedPlayer.tourney_damage || 0, selectedPlayer.tourney_survived || 0, selectedPlayer.tourney_rescue || 0)}

                <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-900 space-y-2">
                  <span className="text-[10px] text-amber-300 font-bold block border-b border-zinc-900 pb-1">สถิติรวมห้องแข่งทั้งหมด</span>
                  <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                    <div className="bg-black p-1.5 rounded border border-zinc-900">
                      <span className="text-zinc-400 block text-[9px]">คิลรวม</span>
                      <strong className="text-amber-300">{selectedPlayer.tourney_kills || 0}</strong>
                    </div>
                    <div className="bg-black p-1.5 rounded border border-zinc-900">
                      <span className="text-zinc-400 block text-[9px]">ดาเมจรวม</span>
                      <strong className="text-white">{selectedPlayer.tourney_damage || 0}</strong>
                    </div>
                    <div className="bg-black p-1.5 rounded border border-zinc-900">
                      <span className="text-zinc-400 block text-[9px]">แอสซิสต์รวม</span>
                      <strong className="text-white">{selectedPlayer.tourney_assists || 0}</strong>
                    </div>
                    <div className="bg-black p-1.5 rounded border border-zinc-900">
                      <span className="text-zinc-400 block text-[9px]">รอดชีวิตรวม</span>
                      <strong className="text-white">{selectedPlayer.tourney_survived || 0}</strong>
                    </div>
                    <div className="bg-black p-1.5 rounded border border-zinc-900">
                      <span className="text-zinc-400 block text-[9px]">ช่วยเพื่อนรวม</span>
                      <strong className="text-white">{selectedPlayer.tourney_rescue || 0}</strong>
                    </div>
                    <div className="bg-black p-1.5 rounded border border-zinc-900">
                      <span className="text-zinc-400 block text-[9px]">เกมรวม</span>
                      <strong className="text-white">{selectedPlayer.tourney_matches || 0}</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isAdmin && (
              <button 
                onClick={() => handleResetSinglePlayerScores(selectedPlayer.id, selectedPlayer.ign)} 
                className="py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 rounded-xl font-bold w-full text-xs transition"
              >
                🔄 รีเซตสถิติผู้เล่นคนนี้
              </button>
            )}

            <button onClick={() => setSelectedPlayer(null)} className="py-2 bg-zinc-800 text-white rounded font-bold w-full">ปิดหน้าต่าง</button>
          </div>
        </div>
      )}

      {previewImage && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="relative max-w-lg w-full flex flex-col items-center space-y-3">
            <div className="w-full flex justify-between items-center px-1">
              <span className="text-sky-400 font-bold text-xs">{previewImage.title}</span>
              <button onClick={() => setPreviewImage(null)} className="bg-zinc-800 text-white font-bold w-8 h-8 rounded-full flex items-center justify-center">✕</button>
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