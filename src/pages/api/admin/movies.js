import { verifyAdminToken, checkPermission } from '@/utils/adminAuth';
import { supabase } from '@/utils/supabase';

export default async function handler(req, res) {
  try {
    const admin = await verifyAdminToken(req);
    if (!admin) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    switch (req.method) {
      case 'GET':
        return await getMovies(req, res, admin);
      case 'POST':
        return await createMovie(req, res, admin);
      case 'PUT':
        return await updateMovie(req, res, admin);
      case 'PATCH':
        return await patchMovie(req, res, admin);
      case 'DELETE':
        return await deleteMovie(req, res, admin);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Movies API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getMovies(req, res, admin) {
  if (!checkPermission(admin.permissions, 'movies.read')) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }

  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      status = '',
      genre = '',
      sort = 'created_at',
      order = 'desc'
    } = req.query;

    let query = supabase
      .from('movies')
      .select(`
        *,
        created_by_admin:admin_users!movies_created_by_fkey(first_name, last_name),
        movie_genre_mapping(
          movie_genres(
            genre_id,
            name
          )
        )
      `, { count: 'exact' });

    // Search filter
    if (search) {
      query = query.or(`title.ilike.%${search}%, description.ilike.%${search}%`);
    }

    // Status filter
    if (status) {
      query = query.eq('status', status);
    }

    // Genre filter
    if (genre) {
      query = query.ilike('genre', `%${genre}%`);
    }

    // Sorting
    const validSorts = ['title', 'created_at', 'release_date', 'duration'];
    const validOrders = ['asc', 'desc'];
    
    if (validSorts.includes(sort) && validOrders.includes(order)) {
      query = query.order(sort, { ascending: order === 'asc' });
    }

    // Pagination
    const startRange = (page - 1) * limit;
    const endRange = startRange + parseInt(limit) - 1;
    
    const { data: movies, error, count } = await query.range(startRange, endRange);

    if (error) throw error;

    res.json({
      success: true,
      movies: movies || [],
      pagination: {
        total: count || 0,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Get movies error:', error);
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
}

async function createMovie(req, res, admin) {
  if (!checkPermission(admin.permissions, 'movies.write')) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }

  try {
    const movieData = req.body;
    console.log('Received movie data:', movieData); // Debug log

    // Validation
    const requiredFields = ['title', 'duration', 'genre', 'rating'];
    for (const field of requiredFields) {
      if (!movieData[field]) {
        return res.status(400).json({ error: `${field} is required` });
      }
    }

    // จัดการ cast field - ให้รองรับทั้ง array และ string
    let castValue = movieData.cast;
    if (Array.isArray(castValue)) {
      castValue = castValue.join(', ');
    } else if (typeof castValue === 'string') {
      castValue = castValue.trim();
    } else {
      castValue = '';
    }

    // Clean and sanitize data
    const cleanedData = {
      ...movieData,
      title: movieData.title?.trim(),
      title_en: movieData.title_en?.trim(),
      description: movieData.description?.trim(),
      genre: movieData.genre?.trim(),
      director: movieData.director?.trim(),
      language: movieData.language?.trim(),
      subtitle: movieData.subtitle?.trim(),
      poster_url: movieData.poster_url?.trim() || null,
      trailer_url: movieData.trailer_url?.trim() || null,
      cast: castValue || null,
    };

    // Add audit fields
    const newMovie = {
      ...cleanedData,
      created_by: admin.id,
      status: movieData.status || 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('Inserting movie:', newMovie); // Debug log

    const { data: movie, error } = await supabase
      .from('movies')
      .insert([newMovie])
      .select(`
        *,
        created_by_admin:admin_users!movies_created_by_fkey(first_name, last_name)
      `)
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      throw error;
    }

    res.status(201).json({
      success: true,
      movie: movie,
      message: 'Movie created successfully'
    });
  } catch (error) {
    console.error('Create movie error:', error);
    
    // ส่ง error message ที่ชัดเจนขึ้น
    let errorMessage = 'Failed to create movie';
    if (error.message) {
      errorMessage += ': ' + error.message;
    }
    if (error.details) {
      errorMessage += ' (' + error.details + ')';
    }
    
    res.status(500).json({ error: errorMessage });
  }
}

async function updateMovie(req, res, admin) {
  if (!checkPermission(admin.permissions, 'movies.write')) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }

  try {
    const { id } = req.query;
    const updateData = req.body;
    console.log('Updating movie ID:', id, 'with data:', updateData); // Debug log

    if (!id) {
      return res.status(400).json({ error: 'Movie ID is required' });
    }

    // Check if movie exists
    const { data: existingMovie } = await supabase
      .from('movies')
      .select('id')
      .eq('id', id)
      .single();

    if (!existingMovie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    // จัดการ cast field - ให้รองรับทั้ง array และ string
    let castValue = updateData.cast;
    if (Array.isArray(castValue)) {
      castValue = castValue.join(', ');
    } else if (typeof castValue === 'string') {
      castValue = castValue.trim();
    } else {
      castValue = '';
    }

    // Clean and sanitize data
    const cleanedData = {
      ...updateData,
      title: updateData.title?.trim(),
      title_en: updateData.title_en?.trim(),
      description: updateData.description?.trim(),
      genre: updateData.genre?.trim(),
      director: updateData.director?.trim(),
      language: updateData.language?.trim(),
      subtitle: updateData.subtitle?.trim(),
      poster_url: updateData.poster_url?.trim() || null,
      trailer_url: updateData.trailer_url?.trim() || null,
      cast: castValue || null,
    };

    // Add audit fields
    const updatedMovie = {
      ...cleanedData,
      updated_by: admin.id,
      updated_at: new Date().toISOString()
    };

    console.log('Updating movie with:', updatedMovie); // Debug log

    const { data: movie, error } = await supabase
      .from('movies')
      .update(updatedMovie)
      .eq('id', id)
      .select(`
        *,
        created_by_admin:admin_users!movies_created_by_fkey(first_name, last_name)
      `)
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      throw error;
    }

    res.json({
      success: true,
      movie: movie,
      message: 'Movie updated successfully'
    });
  } catch (error) {
    console.error('Update movie error:', error);
    
    // ส่ง error message ที่ชัดเจนขึ้น
    let errorMessage = 'Failed to update movie';
    if (error.message) {
      errorMessage += ': ' + error.message;
    }
    if (error.details) {
      errorMessage += ' (' + error.details + ')';
    }
    
    res.status(500).json({ error: errorMessage });
  }
}

async function patchMovie(req, res, admin) {
  if (!checkPermission(admin.permissions, 'movies.write')) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }

  try {
    const { id, status } = req.body;
    console.log('Patching movie ID:', id, 'new status:', status); // Debug log

    if (!id) {
      return res.status(400).json({ error: 'Movie ID is required' });
    }

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    // Validate status value
    const validStatuses = ['active', 'inactive', 'coming_soon'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }

    // Check if movie exists
    const { data: existingMovie } = await supabase
      .from('movies')
      .select('id, status')
      .eq('id', id)
      .single();

    if (!existingMovie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    // Update only the status
    const { data: movie, error } = await supabase
      .from('movies')
      .update({
        status: status,
        updated_by: admin.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        created_by_admin:admin_users!movies_created_by_fkey(first_name, last_name)
      `)
      .single();

    if (error) {
      console.error('Supabase patch error:', error);
      throw error;
    }

    const statusTexts = {
      'active': 'เปิดใช้งาน',
      'inactive': 'ปิดใช้งาน',
      'coming_soon': 'เร็วๆ นี้'
    };

    res.json({
      success: true,
      movie: movie,
      message: `อัปเดตสถานะเป็น "${statusTexts[status]}" เรียบร้อยแล้ว`
    });
  } catch (error) {
    console.error('Patch movie error:', error);
    
    let errorMessage = 'Failed to update movie status';
    if (error.message) {
      errorMessage += ': ' + error.message;
    }
    if (error.details) {
      errorMessage += ' (' + error.details + ')';
    }
    
    res.status(500).json({ error: errorMessage });
  }
}

async function deleteMovie(req, res, admin) {
  if (!checkPermission(admin.permissions, 'movies.write')) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }

  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Movie ID is required' });
    }

    // Check if movie has existing showtimes or bookings
    const { data: showtimes } = await supabase
      .from('showtimes')
      .select('id')
      .eq('movie_id', id)
      .limit(1);

    if (showtimes && showtimes.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete movie with existing showtimes. Please delete all showtimes first.' 
      });
    }

    const { error } = await supabase
      .from('movies')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Movie deleted successfully'
    });
  } catch (error) {
    console.error('Delete movie error:', error);
    res.status(500).json({ error: 'Failed to delete movie' });
  }
} 